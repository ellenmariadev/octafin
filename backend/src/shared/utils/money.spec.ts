import { formatBRL, fromCents, toCents } from "./money";

describe("money", () => {
  describe("toCents", () => {
    it("converts reais to cents", () => {
      expect(toCents(1234.56)).toBe(123456);
    });

    it("rounds floating point imprecision", () => {
      expect(toCents(0.1 + 0.2)).toBe(30);
    });

    it("converts whole numbers", () => {
      expect(toCents(1500)).toBe(150000);
    });
  });

  describe("fromCents", () => {
    it("converts cents to reais", () => {
      expect(fromCents(123456)).toBe(1234.56);
    });
  });

  describe("formatBRL", () => {
    it("formats cents as Brazilian currency", () => {
      expect(formatBRL(123456)).toContain("1.234,56");
    });
  });
});
