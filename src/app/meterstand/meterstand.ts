export class Meterstand {
  public dateTime: Date;
  public stroomTariefIndicator: string;
  public stroomTarief1: number;
  public stroomTarief2: number;
  public gas: number;

  constructor(json: string) {
    const jsonObject: any = JSON.parse(json);
    for (const property in jsonObject) {
      this[property] = jsonObject[property];
    }
  }
}
