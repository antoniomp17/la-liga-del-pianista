import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getStudentView } from "@/app/api/student/view/route";
import { POST as postAdminLogin } from "@/app/api/admin/login/route";
import { GET as getContestInfo } from "@/app/api/contest/info/route";
import { POST as postTestPush } from "@/app/api/notifications/test/route";

describe("API Route Handlers", () => {
  describe("GET /api/contest/info", () => {
    it("returns public contest settings with currentWeek", async () => {
      const res = await getContestInfo();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.currentWeek).toBeGreaterThanOrEqual(1);
      expect(json.data.totalWeeks).toBe(27);
    });
  });

  describe("POST /api/notifications/test", () => {
    it("handles test push requests gracefully", async () => {
      const req = new NextRequest("http://localhost:3000/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await postTestPush(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result).toBeDefined();
    });
  });

  describe("GET /api/student/view", () => {
    it("returns 400 when PIN is not provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/view");
      const res = await getStudentView(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toMatch(/Debes proporcionar tu PIN/i);
    });

    it("returns 404 for an invalid PIN", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/view?pin=0000");
      const res = await getStudentView(req);
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toMatch(/PIN incorrecto o no encontrado/i);
    });

    it("returns 200 with sanitized data for a valid student PIN (e.g. 7429)", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/view?pin=7429");
      const res = await getStudentView(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.currentStudent.name).toBe("Clara Schumann");
      expect(json.data.top10.length).toBeLessThanOrEqual(10);

      // Verify privacy: top10 items must not expose PINs
      for (const st of json.data.top10) {
        expect(st.pin).toBeUndefined();
      }
    });
  });

  describe("POST /api/admin/login", () => {
    it("returns 401 when admin PIN is wrong", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin: "wrong-pin" }),
      });

      const res = await postAdminLogin(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/PIN de profesora incorrecto/i);
    });

    it("returns 200 and a signed token when admin PIN is correct", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin: "piano1234" }),
      });

      const res = await postAdminLogin(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.token).toBeDefined();
      expect(json.token).toContain(".");
    });
  });
});
