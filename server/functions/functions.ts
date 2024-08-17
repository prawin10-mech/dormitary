import BedModel, { IBed } from "../models/bed.model";
import { ICustomer } from "../models/customer.model";

export async function endBedPeriod(bedId: string) {
  try {
    const bed: IBed | null = await BedModel.findById(bedId).populate(
      "customer"
    );

    if (!bed) return;

    const customer = bed.customer as ICustomer | undefined;

    if (customer) {
      customer.checkOutAt = new Date();
      await customer.save();
    }

    if (bed) {
      bed.isOccupied = false;
      bed.customer = undefined;
      await bed?.save();
    }

    console.log("Finished ending bed  period");
  } catch (error) {
    console.log("Error finishing bed period", { error });
  }
}
