import Types "../types/solar-projects";
import Map "mo:core/Map";

module {

  public func createProject(
    projects : Map.Map<Text, Types.SolarProject>,
    nextId : Nat,
    input : Types.CreateProjectInput,
  ) : (Types.SolarProject, Nat) {
    let id = "project-" # debug_show(nextId);
    let project : Types.SolarProject = {
      id;
      slNo = input.slNo;
      employeeType = input.employeeType;
      leadSource = input.leadSource;
      region = input.region;
      projectStatus = input.projectStatus;
      customerName = input.customerName;
      address = input.address;
      phoneNumber = input.phoneNumber;
      consumerAcNo = input.consumerAcNo;
      kw = input.kw;
      salePrice = input.salePrice;
      bookingAmount = input.bookingAmount;
      bookingAmountDate = input.bookingAmountDate;
      bookingAgreementDate = input.bookingAgreementDate;
      signAgreement = input.signAgreement;
      digitalApprovedLetter = input.digitalApprovedLetter;
      financeAmount1 = input.financeAmount1;
      financeDate1 = input.financeDate1;
      financeAmount2 = input.financeAmount2;
      cashAmount2 = input.cashAmount2;
      cashAmount2Date = input.cashAmount2Date;
      financeDate2 = input.financeDate2;
      materialPurchaseDate = input.materialPurchaseDate;
      deliveryDate = input.deliveryDate;
      ewayBillNo = input.ewayBillNo;
      installationDate = input.installationDate;
      netMeteringDate = input.netMeteringDate;
      lastPaymentDate = input.lastPaymentDate;
      pendingAmount = input.pendingAmount;
      subsidyDisbursed = input.subsidyDisbursed;
      invoiceNo = input.invoiceNo;
      gstAmount = input.gstAmount;
      gstFillingMonth = input.gstFillingMonth;
      remarks = input.remarks;
      currentStage = input.currentStage;
      nextStage = input.nextStage;
      district = input.district;
      employeeName = input.employeeName;
      freelancerName = input.freelancerName;
    };
    projects.add(id, project);
    (project, nextId + 1)
  };

  public func updateProject(
    projects : Map.Map<Text, Types.SolarProject>,
    input : Types.UpdateProjectInput,
  ) : ?Types.SolarProject {
    switch (projects.get(input.id)) {
      case null { null };
      case (?existing) {
        let updated : Types.SolarProject = {
          id = existing.id;
          slNo = input.slNo;
          employeeType = input.employeeType;
          leadSource = input.leadSource;
          region = input.region;
          projectStatus = input.projectStatus;
          customerName = input.customerName;
          address = input.address;
          phoneNumber = input.phoneNumber;
          consumerAcNo = input.consumerAcNo;
          kw = input.kw;
          salePrice = input.salePrice;
          bookingAmount = input.bookingAmount;
          bookingAmountDate = input.bookingAmountDate;
          bookingAgreementDate = input.bookingAgreementDate;
          signAgreement = input.signAgreement;
          digitalApprovedLetter = input.digitalApprovedLetter;
          financeAmount1 = input.financeAmount1;
          financeDate1 = input.financeDate1;
          financeAmount2 = input.financeAmount2;
          cashAmount2 = input.cashAmount2;
          cashAmount2Date = input.cashAmount2Date;
          financeDate2 = input.financeDate2;
          materialPurchaseDate = input.materialPurchaseDate;
          deliveryDate = input.deliveryDate;
          ewayBillNo = input.ewayBillNo;
          installationDate = input.installationDate;
          netMeteringDate = input.netMeteringDate;
          lastPaymentDate = input.lastPaymentDate;
          pendingAmount = input.pendingAmount;
          subsidyDisbursed = input.subsidyDisbursed;
          invoiceNo = input.invoiceNo;
          gstAmount = input.gstAmount;
          gstFillingMonth = input.gstFillingMonth;
          remarks = input.remarks;
          currentStage = input.currentStage;
          nextStage = input.nextStage;
          district = input.district;
          employeeName = input.employeeName;
          freelancerName = input.freelancerName;
        };
        projects.add(updated.id, updated);
        ?updated
      };
    }
  };

  public func deleteProject(
    projects : Map.Map<Text, Types.SolarProject>,
    id : Text,
  ) : Bool {
    switch (projects.get(id)) {
      case null { false };
      case (?_) {
        projects.remove(id);
        true
      };
    }
  };

  public func getProject(
    projects : Map.Map<Text, Types.SolarProject>,
    id : Text,
  ) : ?Types.SolarProject {
    projects.get(id)
  };

  public func getAllProjects(
    projects : Map.Map<Text, Types.SolarProject>,
  ) : [Types.SolarProject] {
    projects.values().toArray()
  };

  public func getProjectsByStatus(
    projects : Map.Map<Text, Types.SolarProject>,
    status : Types.ProjectStatus,
  ) : [Types.SolarProject] {
    projects.values().filter(func(p : Types.SolarProject) : Bool {
      p.projectStatus == status
    }).toArray()
  };

  public func getProjectsByRegion(
    projects : Map.Map<Text, Types.SolarProject>,
    region : Text,
  ) : [Types.SolarProject] {
    projects.values().filter(func(p : Types.SolarProject) : Bool {
      p.region == region
    }).toArray()
  };

};
