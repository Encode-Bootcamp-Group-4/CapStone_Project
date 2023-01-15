import { Controller, Post, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("sendSHM")
  sendSHM(@Query("address") _address: string): Promise<string> {
    return this.appService.sendSHM(_address);
  }
}
