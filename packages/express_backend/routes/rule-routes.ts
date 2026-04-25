import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";

export const ruleRouter = express.Router();

import {
  createRule,
  getRulesByHome,
  removeRuleById,
  updateRule,
} from "../models/Rules-Services";

import { Rule } from "../models/Rule";

// =====================
// GET rules by homeId
// =====================
ruleRouter.get("/homeId/:homeId/rules", async (req, res) => {
  try {
    const homeId = new mongoose.Types.ObjectId(req.params.homeId);
    const rules = await getRulesByHome(homeId);
    res.status(200).json(rules);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

// =====================
// CREATE rule (MATCH CALENDAR STYLE)
// =====================
ruleRouter.post("/homeId/:homeId/rules", async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    const { homeId } = req.params;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description required" });
    }

    const rule = await createRule({
      description,
      homeId: new mongoose.Types.ObjectId(homeId),
      status: "PENDING",
      votes: [],
      deleteVotes: [],
      deleteStatus: "NONE",
    });

    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: "Failed to create rule" });
  }
});

// =====================
// DELETE rule (final removal only)
// =====================
ruleRouter.delete("/rules/:id", async (req, res) => {
  try {
    await removeRuleById(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

// =====================
// UPDATE rule
// =====================
ruleRouter.put("/rules/:id", async (req, res) => {
  try {
    const updated = await updateRule(
      new mongoose.Types.ObjectId(req.params.id),
      req.body
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// =====================
// VOTING (YES / NO)
// =====================
ruleRouter.post("/rules/:id/vote", async (req, res) => {
  try {
    const ruleId = new mongoose.Types.ObjectId(req.params.id);
    const { voteId, vote } = req.body;

    const rule = await Rule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    const existing = rule.votes.find((v: any) => v.voteId === voteId);

    if (existing) {
      existing.vote = vote;
    } else {
      rule.votes.push({ voteId, vote });
    }

    const yes = rule.votes.filter((v) => v.vote === "YES").length;
    const no = rule.votes.filter((v) => v.vote === "NO").length;

    if (yes > no) rule.status = "CONFIRMED";
    else if (no > yes) rule.status = "REJECTED";
    else rule.status = "PENDING";

    await rule.save();

    res.status(200).json(rule);
  } catch (err) {
    res.status(400).json({ error: "Voting failed" });
  }
});

// =====================
// DELETE VOTING SYSTEM
// =====================
ruleRouter.post("/rules/:id/delete-vote", async (req, res) => {
  try {
    const ruleId = new mongoose.Types.ObjectId(req.params.id);
    const { voteId, vote } = req.body;

    const rule = await Rule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    const existing = rule.deleteVotes.find((v: any) => v.voteId === voteId);

    if (existing) {
      existing.vote = vote;
    } else {
      rule.deleteVotes.push({ voteId, vote });
    }

    const yes = rule.deleteVotes.filter((v) => v.vote === "YES").length;
    const no = rule.deleteVotes.filter((v) => v.vote === "NO").length;

    // 4 roommates assumption: 2 YES majority
    if (yes > no && yes >= 2) {
      rule.deleteStatus = "CONFIRMED";

      await removeRuleById(ruleId.toString());

      return res.status(200).json({ deleted: true });
    }

    if (no >= yes) {
      rule.deleteStatus = "REJECTED";
    } else {
      rule.deleteStatus = "PENDING";
    }

    await rule.save();

    res.status(200).json(rule);
  } catch (err) {
    res.status(400).json({ error: "Delete voting failed" });
  }
});