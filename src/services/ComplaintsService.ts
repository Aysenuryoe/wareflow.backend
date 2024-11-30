import { Complaint } from "../models/ComplaintsModel";
import { ComplaintsResource } from "../../src/Resources";

export async function getAllComplaints(): Promise<ComplaintsResource[]> {
  const complaints = await Complaint.find().exec();

  return complaints.map((complaint) => ({
    id: complaint._id.toString(),
    referenceId: complaint.referenceId.toString(),
    referenceType: complaint.referenceType,
    reason: complaint.reason,
    quantity: complaint.quantity,
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
    referenceId: complaint.referenceId.toString(),
    referenceType: complaint.referenceType,
    reason: complaint.reason,
    quantity: complaint.quantity,
    status: complaint.status,
  };
}

export async function createComplaint(complaintResource: ComplaintsResource): Promise<ComplaintsResource> {
    const complaint = await Complaint.create({
      referenceId: complaintResource.referenceId,
      referenceType: complaintResource.referenceType,
      reason: complaintResource.reason,
      quantity: complaintResource.quantity,
      status: "Open",
    });
  
    return {
      id: complaint._id.toString(),
      referenceId: complaint.referenceId.toString(),
      referenceType: complaint.referenceType,
      reason: complaint.reason,
      quantity: complaint.quantity,
      status: complaint.status,
    };
  }
  
  export async function updateComplaint(complaintResource: ComplaintsResource): Promise<ComplaintsResource> {
    let complaint = await Complaint.findById(complaintResource.id);
  
    if (!complaint) {
      throw new Error("Complaint not found.");
    }
  
    const updateObject : {
        referenceId?:string;
      referenceType?: string;
      reason?: string;
      quantity?: number;
      status?: string;
    } = {};

    
    if (complaintResource.reason) {
      updateObject.reason = complaintResource.reason;
    }
    if (complaintResource.quantity) {
        updateObject.quantity = complaintResource.quantity;
    }
    if (complaintResource.status) {
        updateObject.status = complaintResource.status;
    }
  
    await Complaint.updateOne({
        _id: complaintResource.id
    },updateObject);
    complaint = await Complaint.findById(complaintResource.id);
   
    return {
      id: complaint!._id.toString(),
      referenceId: complaint!.referenceId.toString(),
      referenceType: complaint!.referenceType,
      reason: complaint!.reason,
      quantity: complaint!.quantity,
      status: complaint!.status,
    };
  }
  

  export async function deleteComplaint(id: string): Promise<void> {
    const complaint = await Complaint.findById(id);
  
    if (!complaint) {
      throw new Error("Complaint not found.");
    }
  
    await Complaint.deleteOne({ _id: id });
  }
  
