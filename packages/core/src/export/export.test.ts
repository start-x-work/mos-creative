import { describe, expect, it } from "vitest";
import { approveRecord } from "../approval";
import { emptyBrief } from "../brief";
import type { CreativeRecord } from "../types";
import {
  fromBackup,
  toBackup,
  toCsv,
  toMarkdown,
  toMarketingOsJson,
} from "./index";

function sampleRecord(): CreativeRecord {
  return {
    id: "rec_1",
    brief: {
      ...emptyBrief("ad_copy"),
      product: { name: "予約くん", summary: "", url: "" },
    },
    generation: {
      id: "gen_1",
      briefId: "brief_1",
      text: "予約の手間を、ひとつ減らす。",
      model: "gemini-2.x",
      createdAt: "2026-07-15T00:00:00Z",
    },
    status: "draft",
  };
}

describe("export always carries the approval trail", () => {
  it("markdown includes approver once approved", () => {
    const approved = approveRecord(sampleRecord(), {
      approver: "山口",
      flagsAcknowledged: true,
      guard: { findings: [], aiJudged: false },
      approvedAt: "2026-07-15T01:00:00Z",
    });
    const md = toMarkdown(approved);
    expect(md).toContain("Approved by: 山口");
  });

  it("marketing-os json carries schema + approval and is O2-ready", () => {
    const approved = approveRecord(sampleRecord(), {
      approver: "山口",
      flagsAcknowledged: true,
      guard: { findings: [], aiJudged: false },
      approvedAt: "2026-07-15T01:00:00Z",
    });
    const json = toMarketingOsJson(approved);
    expect(json.schema).toBe("mos-creative/marketing-os-export@1");
    expect(json.approval?.approver).toBe("山口");
  });

  it("csv has trail columns", () => {
    const csv = toCsv([sampleRecord()]);
    expect(csv.split("\n")[0]).toContain("approver");
    expect(csv.split("\n")[0]).toContain("approvedAt");
  });

  it("backup round-trips", () => {
    const backup = toBackup([sampleRecord()]);
    const restored = fromBackup(backup);
    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe("rec_1");
  });
});
