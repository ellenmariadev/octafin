import { isValidCnpj, maskCnpj, normalizeCnpj } from "./cnpj";

describe("cnpj", () => {
  describe("normalizeCnpj", () => {
    it("removes non-digit characters", () => {
      expect(normalizeCnpj("11.222.333/0001-81")).toBe("11222333000181");
    });
  });

  describe("maskCnpj", () => {
    it("formats a numeric CNPJ", () => {
      expect(maskCnpj("11222333000181")).toBe("11.222.333/0001-81");
    });

    it("returns the input unchanged when length is invalid", () => {
      expect(maskCnpj("123")).toBe("123");
    });
  });

  describe("isValidCnpj", () => {
    it.each(["11.222.333/0001-81", "04.252.011/0001-10"])("accepts valid CNPJ %s", (cnpj) => {
      expect(isValidCnpj(cnpj)).toBe(true);
    });

    it.each(["11.222.333/0001-82", "00000000000000", "11111111111111", "123", ""])(
      "rejects invalid CNPJ %s",
      (cnpj) => {
        expect(isValidCnpj(cnpj)).toBe(false);
      },
    );
  });
});
