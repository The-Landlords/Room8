import express from "express";
import mongoose from "mongoose";
import type { Request, Response } from "express";

import { getHomeByCode } from "../models/Home-Services";
import {
  createRule,
  getRulesByHome,
  removeRuleById,
  updateRule,
} from "../models/Rules-Services";
import { Rule } from "../models/Rule";

export const ruleRouter = express.Router();

const asString = (val: string | string[] | undefined): string => {
  if (!val) throw new Error("Missing param");
  return Array.isArray(val) ? val[0] : val;
};


// GET rules by homeId
ruleRouter.get("/homeId/:homeId/rules", async (req: Request, res: Response) => {
  try {
    const homeId = asString(req.params.homeId);

    const rules = await getRulesByHome(
      new mongoose.Types.ObjectId(homeId)
    );

    return res.status(200).json(rules);
  } catch {
    return res.status(400).json({ error: "Invalid homeId" });
  }
});


//Create rule
ruleRouter.post("/:homeCode/rules", async (req: Request, res: Response) => {
  try {
    const homeCode = asString(req.params.homeCode);

    const home = await getHomeByCode(homeCode);
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }

    const rule = await createRule({
      description: req.body.description,
      homeId: home._id,
      status: "PENDING",
      votes: [],
      deleteVotes: [],
      deleteStatus: "NONE",
    });

    return res.status(201).json(rule);
  } catch {
    return res.status(400).json({ error: "Failed to create rule" });
  }
});


//Update rule
ruleRouter.put("/rules/:ruleId", async (req: Request, res: Response) => {
  try {
    const ruleId = asString(req.params.ruleId);

    const updated = await updateRule(
      new mongoose.Types.ObjectId(ruleId),
      req.body
    );

    if (!updated) {
      return res.status(404).json({ error: "Rule not found" });
    }

    return res.status(200).json(updated);
  } catch {
    return res.status(400).json({ error: "Update failed" });
  }
});


//Delete rule
ruleRouter.delete("/rules/:ruleId", async (req: Request, res: Response) => {
  try {
    const ruleId = asString(req.params.ruleId);

    await removeRuleById(ruleId);

    return res.sendStatus(204);
  } catch {
    return res.status(400).json({ error: "Delete failed" });
  }
});



// Voting system
ruleRouter.post("/rules/:ruleId/vote", async (req: Request, res: Response) => {
  try {
    const ruleId = new mongoose.Types.ObjectId(req.params.ruleId);
    const { voteId, vote } = req.body;

    const rule = await Rule.findById(ruleId);
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    const existing = rule.votes.find((v: any) => v.voteId === voteId);

    if (existing) {
      existing.vote = vote;
    } else {
      rule.votes.push({ voteId, vote });
    }

    const yes = rule.votes.filter(v => v.vote === "YES").length;
    const no = rule.votes.filter(v => v.vote === "NO").length;

    rule.status =
      yes > no ? "CONFIRMED" :
      no > yes ? "REJECTED" :
      "PENDING";

    await rule.save();

    return res.status(200).json(rule);
  } catch {
    return res.status(400).json({ error: "Voting failed" });
  }
});



// Delete voting
ruleRouter.post("/rules/:ruleId/delete-vote", async (req: Request, res: Response) => {
  try {
    const ruleId = new mongoose.Types.ObjectId(req.params.ruleId);
    const { voteId, vote } = req.body;

    const rule = await Rule.findById(ruleId);
    if (!rule) return res.status(404).json({ error: "Rule not found" });


    // Add or update vote
    const existing = rule.deleteVotes.find((v: any) => v.voteId === voteId);

    if (existing) {
      existing.vote = vote;
    } else {
      rule.deleteVotes.push({ voteId, vote });
    }

    await rule.save();

    const yes = rule.deleteVotes.filter(v => v.vote === "YES").length;
    const no = rule.deleteVotes.filter(v => v.vote === "NO").length;

    const TOTAL_RESIDENTS = 4;

    if (no > 0) {
      rule.deleteStatus = "REJECTED";
      await rule.save();
      return res.status(200).json(rule);
    }


    if (yes >= TOTAL_RESIDENTS) {
      await removeRuleById(ruleId.toString());
      return res.status(200).json({ deleted: true });
    }

    rule.deleteStatus = "PENDING";
    await rule.save();


    return res.status(200).json(rule);
  } catch {
    return res.status(400).json({ error: "Delete voting failed" });
  }
});
