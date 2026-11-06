import { connectToDatabase } from "@/server/db";
import CustomerModel from "@/server/models/customer";
import { requireAuth } from "@/server/auth";
import { handleError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    requireAuth();
    await connectToDatabase();

    const customers = await CustomerModel.find().populate("bed").lean();

    // Group bookings by year -> month -> day of check-in.
    const history = customers.reduce((acc, customer: any) => {
      const createdAt = new Date(customer.createdAt);
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth() + 1;
      const day = createdAt.getDate();

      acc[year] ??= {};
      acc[year][month] ??= {};
      acc[year][month][day] ??= [];

      acc[year][month][day].push({
        bed: customer.bed,
        name: customer.name,
        phone: customer.number,
        createdAt: customer.createdAt,
        number: customer.number,
        email: customer.email,
        age: customer.age,
        photo: customer.photo,
        aadharBack: customer.aadharBack,
        aadharFront: customer.aadharFront,
        purpose: customer.purpose,
        period: customer.period,
        checkout: customer.checkOutAt,
      });

      return acc;
    }, {} as Record<number, Record<number, Record<number, any[]>>>);

    return json({ message: "History fetched successfully", history });
  } catch (error) {
    return handleError(error);
  }
}
