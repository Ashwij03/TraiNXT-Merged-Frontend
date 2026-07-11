import DOCUMENT_STATUS from "./Constants/documentStatus";

const statusCycle = [
  DOCUMENT_STATUS.APPROVED,
  DOCUMENT_STATUS.PENDING,
  DOCUMENT_STATUS.DRAFT,
];

function documents(category, names) {
  return names.map((documentName, index) => ({
    documentName,
    category,
    version: index === 0 ? "1.0" : `1.${index}`,
    status: statusCycle[index % statusCycle.length],
    uploadedBy: "Study Staff",
    approvedBy: index % statusCycle.length === 0 ? "Principal Investigator" : "-",
    modifiedDate: index % 2 === 0 ? "02-May-2026" : "15-Mar-2026",
    expiryDate: "-",
    fileName: `${documentName.replace(/[^a-z0-9]+/gi, "_")}.pdf`,
    fileSize: `${(0.8 + index * 0.3).toFixed(1)} MB`,
  }));
}

const EISF_ASSIGNED_MODULES = {
  randomization: {
    id: "12.0",
    title: "Participant Randomisation / Registration Procedures",
    description: "Manage randomisation, registration, unblinding and related correspondence documents.",
    sections: [
      {
        id: "12.1",
        title: "Randomisation / Registration User Manual",
        description: "Copy of trial-specific participant randomisation or registration user manual, current and superseded.",
        documents: documents("Randomisation", [
          "Randomisation / Registration User Manual - Current",
          "Randomisation / Registration User Manual - Superseded",
        ]),
      },
      {
        id: "12.2",
        title: "Records of Unblinding - Local Participants",
        description: "Copies of local participant unblinding records and reasons for unblinding during study conduct.",
        documents: documents("Unblinding", [
          "Local Participant Unblinding Record",
          "Unblinding Reason Documentation",
        ]),
      },
      {
        id: "12.3",
        title: "Related Correspondence",
        description: "Significant correspondence relating to participant randomisation and unblinding procedures to and from the Sponsor.",
        documents: documents("Correspondence", [
          "Randomisation Correspondence with Sponsor",
          "Unblinding Procedure Correspondence",
        ]),
      },
    ],
  },

  dataManagement: {
    id: "13.0",
    title: "Data Management - Forms & Procedures",
    description: "Manage CRFs, EDC account forms, source document plans and data-management correspondence.",
    sections: [
      {
        id: "13.1",
        title: "Blank Paper CRF - Current and Superseded",
        description: "Paper CRF files for printing, current and superseded. Completed CRFs are part of the ISF but filed separately.",
        documents: documents("CRF", ["Blank Paper CRF - Current", "Blank Paper CRF - Superseded"]),
      },
      {
        id: "13.2",
        title: "CRF Completion Guidelines",
        description: "CRF completion guidelines, current and superseded versions.",
        documents: documents("Guideline", ["CRF Completion Guidelines - Current", "CRF Completion Guidelines - Superseded"]),
      },
      {
        id: "13.3",
        title: "Completed EDC System Account Application Forms",
        description: "Completed and signed EDC account application forms for applicable study team members.",
        documents: documents("EDC", ["EDC System Account Application Form - PI", "EDC System Account Application Form - Study Coordinator"]),
      },
      {
        id: "13.4",
        title: "Source Document Plan - Current and Superseded",
        description: "Site-specific Source Document Plan completed, signed and dated by the Site Principal Investigator.",
        documents: documents("Source Document", ["Source Document Plan - Current", "Source Document Plan - Superseded"]),
      },
      {
        id: "13.5",
        title: "Related Correspondence",
        description: "Significant correspondence relating to data management to and from the Sponsor.",
        documents: documents("Correspondence", ["Data Management Correspondence"]),
      },
    ],
  },

  safety: {
    id: "14.0",
    title: "Safety Monitoring & Reporting",
    description: "Manage safety report forms, reference safety information, completed safety reports and correspondence.",
    sections: [
      {
        id: "14.1",
        title: "Blank Expedited Safety Report Forms",
        description: "Blank SAE forms, cover sheets, completion instructions and pregnancy-reporting forms where applicable.",
        documents: documents("Safety Form", ["Blank Expedited Safety Report Form", "SAE Report Cover Sheet", "SAE Completion Instructions", "Expedited Pregnancy Report Form"]),
      },
      {
        id: "14.2",
        title: "Reference Safety Information",
        description: "Reference safety information including Investigator Brochure, Product Information and IB version tracker.",
        documents: documents("Reference Safety", ["Reference Safety Information - Current", "Reference Safety Information - Superseded", "IB Version Tracker"]),
      },
      {
        id: "14.3",
        title: "Completed Expedited Safety Report Forms and Correspondence",
        description: "Completed initial and follow-up SAE reports signed by the Site Principal Investigator and sent to Sponsor.",
        documents: documents("Safety Report", ["Completed Initial SAE Report", "Completed Follow-up SAE Report", "SAE Correspondence to Sponsor"]),
      },
      {
        id: "14.4",
        title: "Safety Reports to RGO or Regulatory Authority",
        description: "Site-specific safety reports and related correspondence submitted to local RGO or Regulatory Authorities.",
        documents: documents("Regulatory Safety", ["Safety Notification to RGO", "Regulatory Authority Safety Correspondence"]),
      },
      {
        id: "14.5",
        title: "On-Site Procedure for Unblinding",
        description: "Site-specific emergency unblinding procedures for medical emergency or safety-reporting purposes.",
        documents: documents("Unblinding", ["Emergency Unblinding Manual - Current", "Emergency Unblinding Manual - Superseded"]),
      },
      {
        id: "14.6",
        title: "Related Correspondence",
        description: "Dear Investigator Letters, safety memos, safety notifications, SUSAR listings and other safety correspondence.",
        documents: documents("Correspondence", ["Dear Investigator Letter", "Safety Memo", "SUSAR Line Listing", "Safety Monitoring Correspondence"]),
      },
    ],
  },

  monitoring: {
    id: "15.0",
    title: "Study Quality Assurance, Monitoring, Audits & Inspections",
    description: "Manage site monitoring logs, monitoring visit correspondence, close-out, audit and inspection documentation.",
    sections: [
      {
        id: "15.1",
        title: "Reserved - Sponsor/CPI Maintained",
        description: "This section is deliberately left blank and should not contain site files.",
        documents: [],
      },
      {
        id: "15.2",
        title: "Site Monitoring Log",
        description: "Site-specific Site Monitoring and Visit Log recording site monitoring and audit visits.",
        documents: documents("Monitoring", ["Site Monitoring and Visit Log"]),
      },
      {
        id: "15.3",
        title: "Reserved - Sponsor/CPI Maintained",
        description: "This section is deliberately left blank and should not contain site files.",
        documents: [],
      },
      {
        id: "15.4",
        title: "Monitoring Visit Correspondence and Feedback",
        description: "Monitoring visit confirmation letters and monitoring visit follow-up letters.",
        documents: documents("Monitoring Correspondence", ["Monitoring Visit Confirmation Letter", "Monitoring Visit Follow Up Letter"]),
      },
      {
        id: "15.5",
        title: "Trial Close-Out",
        description: "Trial close-out report, close-out letter, archive agreement letter and close-out correspondence.",
        documents: documents("Close-Out", ["Trial Close-Out Report", "Trial Close-Out Letter", "Investigator Agreement to Archive Letter", "Close-Out Correspondence"]),
      },
      {
        id: "15.6",
        title: "Local Research Governance Audit Reports and Correspondence",
        description: "Audit reports and related correspondence for audits occurring at site.",
        documents: documents("Audit", ["Local Audit Report", "Audit Correspondence"]),
      },
      {
        id: "15.7",
        title: "Regulatory Inspections Reports and Correspondence",
        description: "Regulatory inspection reports and related inspection correspondence.",
        documents: documents("Inspection", ["Regulatory Inspection Report", "Regulatory Inspection Correspondence"]),
      },
    ],
  },

  laboratory: {
    id: "16.0",
    title: "Local Laboratory Documentation",
    description: "Manage laboratory manuals, accreditation certificates, reference ranges, biospecimen logs and lab correspondence.",
    sections: [
      { id: "16.1", title: "Research Sample Lab Manual", description: "Trial-specific Research Sample Lab Manual, current and superseded.", documents: documents("Laboratory", ["Research Sample Lab Manual - Current", "Research Sample Lab Manual - Superseded"]) },
      { id: "16.2", title: "Local Lab Certificates of Accreditation", description: "Local site laboratory accreditation certificate such as NATA or equivalent.", documents: documents("Accreditation", ["Local Lab Accreditation Certificate"]) },
      { id: "16.3", title: "Normal Local Lab Reference Ranges", description: "Local site laboratory reference ranges, current and superseded.", documents: documents("Reference Range", ["Local Lab Reference Ranges - Current", "Local Lab Reference Ranges - Superseded"]) },
      { id: "16.4", title: "Biospecimen Collection Log", description: "Biospecimen Collection Log updated as samples are collected, processed and stored.", documents: documents("Biospecimen", ["Biospecimen Collection Log - Current", "Biospecimen Collection Log - Superseded"]) },
      { id: "16.5", title: "Biospecimen Shipment Receipt Tracking", description: "Courier documents, invoices, receipts, declarations, consignment notes and import permits.", documents: documents("Shipment", ["Biospecimen Courier Shipping Document", "Biospecimen Shipment Receipt", "Biospecimen Import Permit"]) },
      { id: "16.6", title: "Biospecimen Storage Monitoring Documentation", description: "Site-specific biospecimen storage monitoring records such as freezer or liquid nitrogen logs.", documents: documents("Storage", ["Freezer Temperature Log", "Liquid Nitrogen Monitoring Log"]) },
      { id: "16.7", title: "Related Correspondence", description: "Significant correspondence relating to biospecimen research aspects of the study.", documents: documents("Correspondence", ["Laboratory Correspondence with Sponsor"]) },
    ],
  },

  supplies: {
    id: "17.0",
    title: "Supplies / Shipping Records",
    description: "Manage records for provision and receipt of study supplies excluding investigational product or devices.",
    sections: [
      {
        id: "17.1",
        title: "Documentation Relating to Provision of Study Supplies",
        description: "Correspondence, documentation and receipts for study supplies such as paper CRFs, diaries and blood collection tubes.",
        documents: documents("Supplies", ["Study Supplies Provision Correspondence", "Study Supplies Receipt", "Paper CRF Supply Record", "Blood Collection Tube Supply Record"]),
      },
    ],
  },

  legal: {
    id: "18.0",
    title: "Legal Documentation",
    description: "Manage clinical trial agreements, other agreements and related legal correspondence.",
    sections: [
      { id: "18.1", title: "Fully Executed Clinical Trial Agreement", description: "Clinical Trial Agreement with site, fully executed.", documents: documents("Agreement", ["Fully Executed Clinical Trial Agreement"]) },
      { id: "18.2", title: "Other Agreements", description: "Material Transfer Agreements, Data Sharing Agreements, Insurance/Indemnity and Expressions of Interest.", documents: documents("Agreement", ["Material Transfer Agreement", "Data Sharing Agreement", "Insurance / Indemnity", "Expression of Interest"]) },
      { id: "18.3", title: "Related Correspondence", description: "Significant correspondence relating to agreements pertaining to the study.", documents: documents("Correspondence", ["Legal Agreement Correspondence"]) },
    ],
  },

  finance: {
    id: "19.0",
    title: "Finance Documentation",
    description: "Manage invoices, receipts, budget correspondence and per-patient payment documentation.",
    sections: [
      { id: "19.1", title: "Invoices / Receipts", description: "Site-specific invoices and receipts including per-patient payment requests made to Sponsor.", documents: documents("Finance", ["Site Invoice", "Site Receipt", "Per Patient Payment Request"]) },
      { id: "19.2", title: "Related Correspondence", description: "Correspondence about study budget, invoice tracking and per-patient payments.", documents: documents("Correspondence", ["Budget Correspondence", "Invoice Tracking Correspondence", "Per Patient Payment Correspondence"]) },
    ],
  },

  otherCommunication: {
    id: "20.0",
    title: "Other Communication",
    description: "Manage newsletters from Sponsor-Investigator and other general sponsor correspondence.",
    sections: [
      { id: "20.1", title: "Newsletters from Sponsor-Investigator", description: "Newsletters received from the Sponsor to participating sites.", documents: documents("Newsletter", ["Sponsor Newsletter"]) },
      { id: "20.2", title: "Other General Correspondence", description: "Other significant general correspondence received from Sponsor.", documents: documents("Correspondence", ["General Sponsor Correspondence"]) },
    ],
  },

  archiving: {
    id: "21.0",
    title: "Archiving",
    description: "Manage archiving details and correspondence relating to trial archiving.",
    sections: [
      { id: "21.1", title: "Archiving Details", description: "Investigator Agreement to Archive Trial Documents Form completed and signed by Site Investigator and Sponsor.", documents: documents("Archiving", ["Investigator Agreement to Archive Trial Documents Form"]) },
      { id: "21.2", title: "Related Correspondence", description: "Significant correspondence regarding trial archiving to and from Sponsor.", documents: documents("Correspondence", ["Trial Archiving Correspondence"]) },
    ],
  },

  investigationalProduct: {
    id: "22.0",
    title: "Investigational Product (Drug / Device Trials Only)",
    description: "Manage pharmacy manuals, IP shipment, accountability, storage, returns, destruction and IP correspondence.",
    sections: [
      { id: "22.1", title: "Instructions for Handling IP and Trial Related Materials", description: "Pharmacy Manual and Drug Order Form, current and superseded.", documents: documents("IP Handling", ["Pharmacy Manual - Current", "Pharmacy Manual - Superseded", "Drug Order Form - Current", "Drug Order Form - Superseded"]) },
      { id: "22.2", title: "Documentation of IP Shipment", description: "Shipping records of investigational product to site, if applicable.", documents: documents("IP Shipment", ["IP Shipping Record", "Drug Receipt Record"]) },
      { id: "22.3", title: "Documentation of IP Dispensing, Accountability and Inventory", description: "Bulk and individual drug accountability logs, current and superseded.", documents: documents("IP Accountability", ["Bulk Drug Accountability Log - Current", "Individual Drug Accountability Log - Current", "Bulk Drug Accountability Log - Superseded", "Individual Drug Accountability Log - Superseded"]) },
      { id: "22.4", title: "Documentation of IP Storage Monitoring", description: "IP storage facility monitoring records such as freezer and fridge temperature logs.", documents: documents("IP Storage", ["Fridge Temperature Log", "Freezer Temperature Log", "IP Storage Maintenance Log"]) },
      { id: "22.5", title: "Documentation of IP Quarantine, Returns and Destruction", description: "IP deviation reports, quarantine records, company assessments, returns and drug destruction forms.", documents: documents("IP Disposition", ["IP Deviation Report", "IP Quarantine Record", "Drug Company Assessment", "IP Return Form", "Drug Destruction Form"]) },
      { id: "22.6", title: "Related Correspondence", description: "Significant correspondence relating to investigational product to and from Sponsor.", documents: documents("Correspondence", ["Investigational Product Correspondence"]) },
    ],
  },
};

export default EISF_ASSIGNED_MODULES;
