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

// get homeId
ruleRouter.get("/homes/rules/:homeId", async (req, res) => {
  try {
    const homeId = new mongoose.Types.ObjectId(req.params.homeId);
    const rules = await getRulesByHome(homeId);
    res.status(200).json(rules);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

// create rule
ruleRouter.post("/homes/rules", async (req: Request, res: Response) => {
  try {
    const { description, homeId } = req.body;

    const rule = await createRule({
      description,
      homeId,
      status: "PENDING",
      votes: [],
    });

    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: "Failed to create rule" });
  }
});

// delete rule
ruleRouter.delete("/homes/rules/:id", async (req, res) => {
  try {
    await removeRuleById(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

// update rule
ruleRouter.put("/homes/rules/:id", async (req, res) => {
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

// Vote logic
ruleRouter.post("/homes/rules/:id/vote", async (req, res) => {
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

    if (yes > no) {
      rule.status = "CONFIRMED";
    } else if (no > yes) {
      rule.status = "REJECTED";
    } else {
      rule.status = "PENDING";
    }

    await rule.save();

    res.status(200).json(rule);
  } catch (err) {
    res.status(400).json({ error: "Voting failed" });
  }
});