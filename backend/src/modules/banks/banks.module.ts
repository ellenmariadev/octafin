import { Module } from "@nestjs/common";
import { BankGateway } from "./application/bank-gateway";
import { BankGoldAdapter } from "./adapters/bank-gold.adapter";
import { BankSilverAdapter } from "./adapters/bank-silver.adapter";

@Module({
  providers: [
    BankGoldAdapter,
    BankSilverAdapter,
    {
      provide: BankGateway,
      useFactory: (gold: BankGoldAdapter, silver: BankSilverAdapter) =>
        new BankGateway([gold, silver]),
      inject: [BankGoldAdapter, BankSilverAdapter],
    },
  ],
  exports: [BankGateway],
})
export class BanksModule {}
