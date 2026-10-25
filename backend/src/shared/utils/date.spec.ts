import { formatDateBR, isValidBirthDate } from "./date";

const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

function todayInBrazil(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

describe("date", () => {
  describe("isValidBirthDate", () => {
    it("accepts a plausible birth date", () => {
      expect(isValidBirthDate("1990-05-15")).toBe(true);
    });

    it("rejects today and future dates", () => {
      const today = todayInBrazil();
      expect(isValidBirthDate(today)).toBe(false);
      expect(isValidBirthDate("2050-01-01")).toBe(false);
    });

    it.each([
      "1800-01-01",
      "1990-13-01",
      "1990-02-30",
      "15-05-1990",
      "not-a-date",
      "",
      undefined,
    ])("rejects %s", (value) => {
      expect(isValidBirthDate(value)).toBe(false);
    });

    it("rejects leap-day on non-leap years", () => {
      expect(isValidBirthDate("1999-02-29")).toBe(false);
      expect(isValidBirthDate("2000-02-29")).toBe(true);
    });
  });

  describe("formatDateBR", () => {
    it("formats a YYYY-MM-DD string as DD/MM/YYYY", () => {
      expect(formatDateBR("1990-05-15")).toBe("15/05/1990");
    });

    it("formats a Date in the Brazil timezone", () => {
      const noonUtc = new Date(Date.UTC(1990, 4, 15, 12));
      expect(formatDateBR(noonUtc)).toBe("15/05/1990");
    });
  });
});
