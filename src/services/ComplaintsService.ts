import { Complaint } from "../models/ComplaintsModel";
import { ComplaintsResource } from "../../src/Resources";

export async function getAllComplaints(): Promise<ComplaintsResource[]> {
  const complaints = await Complaint.find().exec();

  return complaints.map((complaint) => ({
    id: complaint._id.toString(),
    referenceType: complaint.referenceType,
    products: complaint.products.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: complaint.status,
  }));
}

export async function getComplaint(id: string): Promise<ComplaintsResource> {
  const complaint = await Complaint.findById(id).exec();

  if (!complaint) {
    throw new Error("Complaint not found.");
  }

  return {
    id: complaint._id.toString(),
    referenceType: complaint.referenceType,
    products: complaint.products.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: complaint.status,
  };
}

export async function createComplaint(
  complaintResource: ComplaintsResource
): Promise<ComplaintsResource> {
  const complaint = await Complaint.create({
    referenceType: complaintResource.referenceType,
    products: complaintResource.products.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: complaintResource.status,
  });

  return {
    id: complaint._id.toString(),
    referenceType: complaint.referenceType,
    products: complaint.products.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: complaint.status,
  };
}

export async function updateComplaint(
  complaintResource: ComplaintsResource
): Promise<ComplaintsResource> {
  let complaint = await Complaint.findById(complaintResource.id);

  if (!complaint) {
    throw new Error("Complaint not found.");
  }

  const updateObject: {
    referenceType?: string;
    products?: {
      productId: string;
      quantity: number;
      reason: string;
    }[];
    status?: string;
  } = {};

  if (complaintResource.referenceType) {
    updateObject.referenceType = complaintResource.referenceType;
  }

  if (complaintResource.products) {
    updateObject.products = complaintResource.products.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      reason: item.reason,
    }));
  }

  if (complaintResource.status) {
    updateObject.status = complaintResource.status;
  }

  await Complaint.updateOne(
    {
      _id: complaintResource.id,
    },
    updateObject
  );
  let updatedComplaint = await Complaint.findById(complaintResource.id);
  if (!updatedComplaint) {
    throw new Error("Complaint not found.");
  }

  return {
    id: updatedComplaint._id.toString(),
    referenceType: updatedComplaint.referenceType,
    products: updatedComplaint.products.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: updatedComplaint.status,
  };
}

export async function deleteComplaint(id: string): Promise<void> {
  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new Error("Complaint not found.");
  }

  await Complaint.deleteOne({ _id: id });
}
