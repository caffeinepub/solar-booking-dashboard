import Map "mo:core/Map";
import NewTypes "./types/solar-projects";
import UserTypes "./types/users";

module {

  // Old SolarProject type (from previous deployment — before new fields were added)
  type OldProjectStatus = {
    #OPEN;
    #ONGOING;
    #CLOSED;
    #REJECT;
  };

  type OldSolarProject = {
    id : Text;
    slNo : Nat;
    employeeType : Text;
    leadSource : Text;
    region : Text;
    projectStatus : OldProjectStatus;
    customerName : Text;
    address : ?Text;
    phoneNumber : ?Text;
    consumerAcNo : ?Text;
    kw : ?Float;
    salePrice : ?Float;
    bookingAmount : ?Float;
    bookingAgreementDate : ?Text;
    signAgreement : ?Bool;
    digitalApprovedLetter : ?Bool;
    financeAmount1 : ?Float;
    financeDate1 : ?Text;
    financeAmount2 : ?Float;
    cashAmount2 : ?Float;
    financeDate2 : ?Text;
    materialPurchaseDate : ?Text;
    deliveryDate : ?Text;
    ewayBillNo : ?Text;
    installationDate : ?Text;
    netMeteringDate : ?Text;
    lastPaymentDate : ?Text;
    pendingAmount : ?Float;
    subsidyDisbursed : ?Float;
    invoiceNo : ?Text;
    gstAmount : ?Float;
    gstFillingMonth : ?Text;
    remarks : ?Text;
  };

  // Old stable actor shape (only top-level let bindings from main.mo)
  type OldActor = {
    projects : Map.Map<Text, OldSolarProject>;
    users : Map.Map<Text, UserTypes.User>;
    sessions : Map.Map<Text, Text>;
  };

  // New stable actor shape
  type NewActor = {
    projects : Map.Map<Text, NewTypes.SolarProject>;
    users : Map.Map<Text, UserTypes.User>;
    sessions : Map.Map<Text, Text>;
  };

  func migrateProjectStatus(old : OldProjectStatus) : NewTypes.ProjectStatus {
    switch (old) {
      case (#OPEN) { #OPEN };
      case (#ONGOING) { #ONGOING };
      case (#CLOSED) { #CLOSED };
      case (#REJECT) { #REJECT };
    }
  };

  func migrateProject(old : OldSolarProject) : NewTypes.SolarProject {
    {
      id = old.id;
      slNo = old.slNo;
      employeeType = old.employeeType;
      leadSource = old.leadSource;
      region = old.region;
      projectStatus = migrateProjectStatus(old.projectStatus);
      customerName = old.customerName;
      address = old.address;
      phoneNumber = old.phoneNumber;
      consumerAcNo = old.consumerAcNo;
      kw = old.kw;
      salePrice = old.salePrice;
      bookingAmount = old.bookingAmount;
      bookingAmountDate = null;
      bookingAgreementDate = old.bookingAgreementDate;
      signAgreement = old.signAgreement;
      digitalApprovedLetter = old.digitalApprovedLetter;
      financeAmount1 = old.financeAmount1;
      financeDate1 = old.financeDate1;
      financeAmount2 = old.financeAmount2;
      cashAmount2 = old.cashAmount2;
      cashAmount2Date = null;
      financeDate2 = old.financeDate2;
      materialPurchaseDate = old.materialPurchaseDate;
      deliveryDate = old.deliveryDate;
      ewayBillNo = old.ewayBillNo;
      installationDate = old.installationDate;
      netMeteringDate = old.netMeteringDate;
      lastPaymentDate = old.lastPaymentDate;
      pendingAmount = old.pendingAmount;
      subsidyDisbursed = old.subsidyDisbursed;
      invoiceNo = old.invoiceNo;
      gstAmount = old.gstAmount;
      gstFillingMonth = old.gstFillingMonth;
      remarks = old.remarks;
      currentStage = null;
      nextStage = null;
      district = null;
      employeeName = null;
      freelancerName = null;
    }
  };

  public func run(old : OldActor) : NewActor {
    let newProjects = old.projects.map<Text, OldSolarProject, NewTypes.SolarProject>(
      func(_id, oldProject) {
        migrateProject(oldProject)
      }
    );
    {
      projects = newProjects;
      users = old.users;
      sessions = old.sessions;
    }
  };

};
