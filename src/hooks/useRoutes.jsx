import React from "react";
import Home from "@/pages/home";
import Branches from "@/pages/branches";
import BranchDetails from "@/pages/branches/branch-details";
import Users from "@/pages/users";
import UserDetails from "@/pages/users/user-details";
import Permission from "@/pages/permissions";
import PermissionsDetails from "@/pages/permissions/permssions-details";
import { Navigate } from "react-router-dom";
import Vouchers from "@/pages/vouchers";
import ActionVoucher from "@/pages/vouchers/action-voucher";
import FundedBond from "@/pages/vouchers/funded-bond";
import Employee from "@/pages/employes/index";
import ActionEmployee from "@/pages/employes/employee-details";
import Login from "@/pages/login";
import ForgetPassword from "@/pages/login/forget-password";
import Salary from "@/pages/salary";
import ActionSalary from "@pages/salary/action-salary";
import Delayed from "@/pages/delayed";
import BookingDetails from "@/pages/delayed/booking-details";
import PatientArchive from "@/pages/patient-archive";
import AddPatient from "@/pages/patient-archive/add-patient";
import PatientFile from "@/pages/patient-archive/patient-file";
import Complaints from "@/pages/complaints";
import ComplaintActions from "@/pages/complaints/complaint-action";
import HairCare from "@/pages/hair-care";
import HairDetails from "@/pages/hair-care/hair-details";
import AddHairCare from "@/pages/hair-care/add-hair-care";
import Injections from "@/pages/injections";
import InjectionDetails from "@/pages/injections/injection-details";
import ReservationPatients from "@/pages/booking/reservation-patients";
import ReservationPatientsDetails from "@/pages/booking/reservation-patients/reservation-patients-details";
import ImplantedPatients from "@/pages/booking/implantedPatients";
import ImplantedPatientsDetails from "@/pages/booking/implantedPatients/implanted-patients-details";
import PatientsWithoutReservation from "@/pages/booking/patients-without-reservation";
import PatientsWithoutReservationDetails from "@/pages/booking/patients-without-reservation/patients-without-reservation-details";
import EmployeeShow from "@/pages/employes/employee-show";
import Tenchnician from "@/pages/tenchnician";
import AddTenchnician from "@/pages/tenchnician/add-tenchnician";
import ShowTenchnician from "@/pages/tenchnician/show-tenchnician";
import PhysicianAssistant from "@/pages/physician-assistant";
import AddPhysicianAssistant from "@/pages/physician-assistant/add-physician-assistant";
import ShowPhysicianAssistant from "@/pages/physician-assistant/show-physician-assistant";
import Bonus from "@/pages/bonus";
import AddBonus from "@/pages/bonus/add-bonus";
import Deduction from "@/pages/deduction";
import AddDeduction from "@/pages/deduction/add-deduction";
import Warehouse from "@/pages/warehouse";
import Items from "@/pages/items";
import Package from "@/pages/package";
import WarehouseDetails from "@/pages/warehouse/warehouse-details";
import ActionItem from "@/pages/items/action-item";
import ActionPackage from "@/pages/package/action-package";
import Bills from "@/pages/bills";
import ActionBill from "@/pages/bills/action-bill";
import Maintenance from "@/pages/maintenance";
import ActionMaintenance from "@/pages/maintenance/action-maintenance";
import OperationBooking from "@/pages/surgeries/operation-bookings";
import BookOperations from "@/pages/surgeries/operation-bookings/book-the-operation";
import ActionOperationBooking from "@/pages/surgeries/operation-bookings/action-operation-booking";
import OperationBookingDetails from "@/pages/surgeries/operation-bookings/operation-bookings-details";
import ActionHairTransplant from "@/pages/surgeries/operation-bookings/action-hair-transplant";
import HairTransplantDetails from "@/pages/surgeries/operation-bookings/hair-transplant-details";
import CanceledOperations from "@/pages/surgeries/canceled-operations";
import NormalPatient from "@/pages/booking/normal-add-patient";
import BookTheOperation from "@/pages/surgeries/operation-bookings/book-the-operation";
import WarehouseAction from "@/pages/warehouse/warehouse-action";
import Departments from "@/pages/departments";
import ActionDepartment from "@/pages/departments/action-department";
import JobTitle from "@/pages/job-title";
import ActionJobTitle from "@/pages/job-title/action-jobTitle";
import GeneralBookingDetails from "@/pages/booking/booking-details";
import Holiday from "@/pages/holiday";
import ActionHoliday from "@/pages/holiday/action-holiday";
import Cashier from "@/pages/cashier";
import ActionCashier from "@/pages/cashier/action-cashier";
import Sponsors from "@/pages/sponsors";
import AddSponsor from "@/pages/sponsors/add-sponsor";
import AddInjections from "@/pages/injections/add-injections";
import Setting from "@/pages/setting";
import CashierDetails from "@/pages/cashier/cashier-details";
import Vendors from "@/pages/vendors";
import VendorDetails from "@/pages/vendors/vendor-details";
import Offers from "@/pages/offers";
import ActionOffer from "@/pages/offers/action-offer";
import InvoicePage from "@/pages/bills/bill-invoice";
import Doctors from "@/pages/doctors";
import ReasonForNotBooking from "@/pages/reasons-for-not-booking";
import ActionReasonForNotBooking from "@/pages/reasons-for-not-booking/add-reason-for-not-booking";
import ActionDoctor from "@/pages/doctors/add-doctors";
import BondInvoice from "@/pages/vouchers/bond-invoice";
import BookingStatus from "@/pages/booking/booking-status";
import BookingStatusDetails from "@/pages/booking/booking-status/status-details";
import MaintenanceInvoice from "@/pages/maintenance/maintenance-invoice";
import ReservationInvoice from "@/pages/booking/reservation-invoice";
import SurgeriesInvoice from "@/pages/surgeries/surgeries-invoice";
import ShowDoctor from "@/pages/doctors/show-doctors";
import PrintPledge from "@/pages/surgeries/operation-bookings/print-pledge";
import Examination from "@/pages/examination";
import ExaminationActions from "@/pages/examination/examination-action";
import Admins from "@/pages/admins";
import AdminAction from "@/pages/admins/admin-action";
import AdminsShow from "@/pages/admins/admins-show";
import ExaminationDetails from "@/pages/examination/examination-details";
const useRoutes = () => {
  const privateRoute = [
    { route: "/homepage", element: <Home /> },
    { route: "/accounts/vouchers", element: <Vouchers /> },
    { route: "/accounts/vouchers/funded-bond", element: <FundedBond /> },
    { route: "/accounts/vouchers/funded-bond/:id", element: <FundedBond /> },
    { route: "/accounts/vouchers/bond-invoice/:id", element: <BondInvoice /> },
    { route: "/accounts/vouchers/:id", element: <ActionVoucher /> },
    { route: "/examination", element: <Examination /> },
    { route: "/examination/:id", element: <ExaminationActions /> },
    { route: "/examination/examination-details/:id", element: <ExaminationDetails /> },

    { route: "/branches", element: <Branches /> },
    { route: "/branches/:id", element: <BranchDetails /> },
    { route: "/users", element: <Users /> },
    { route: "/users/:id", element: <UserDetails /> },
    { route: "/sponsors", element: <Sponsors /> },
    { route: "/sponsors/add", element: <AddSponsor /> },
    { route: "/sponsors/:id", element: <AddSponsor /> },
    { route: "/permissions", element: <Permission /> },
    { route: "/permissions/:id", element: <PermissionsDetails /> },
    { route: "/staff/employee", element: <Employee /> },
    { route: "/staff/employee/:id", element: <ActionEmployee /> },
    { route: "/staff/employee/:id/show", element: <EmployeeShow /> },
    { route: "/staff/admin", element: <Admins /> },
    { route: "/staff/admin/:id", element: <AdminAction /> },
    { route: "/staff/admin/:id/show", element: <AdminsShow /> },
    { route: "/salary", element: <Salary /> },
    { route: "/salary/:id", element: <ActionSalary /> },
    { route: "/delayed", element: <Delayed /> },
    { route: "/delayed/:id", element: <BookingDetails /> },
    { route: "/patient", element: <PatientArchive /> },
    { route: "/patient/:id", element: <AddPatient /> },
    { route: "/patient-details/:id", element: <PatientFile /> },
    { route: "/complaints", element: <Complaints /> },
    { route: "/complaints/:id", element: <ComplaintActions /> },
    { route: "/offers", element: <Offers /> },
    { route: "/offers/:id", element: <ActionOffer /> },
    { route: "/hair", element: <HairCare /> },
    { route: "/hair/:id", element: <HairDetails /> },
    { route: "/hair/add-hair-care/:id", element: <AddHairCare /> },
    { route: "/injections", element: <Injections /> },
    { route: "/injections/:id", element: <InjectionDetails /> },
    { route: "/injections/add-injections/:id", element: <AddInjections /> },
    { route: "/booking/reservation-patients", element: <ReservationPatients /> },
    { route: "/booking/reservation-patients/:id", element: <ReservationPatientsDetails /> },
    { route: "/booking/implanted-patients", element: <ImplantedPatients /> },
    { route: "/booking/implanted-patients/:id", element: <ImplantedPatientsDetails /> },
    { route: "/booking/patients-without-reservation", element: <PatientsWithoutReservation /> },
    { route: "/booking/general-booking-details/:id", element: <GeneralBookingDetails /> },
    { route: "/booking/reservation-invoice/:id", element: <ReservationInvoice /> },
    {
      route: "/booking/patients-without-reservation/:id",
      element: <PatientsWithoutReservationDetails />,
    },
    { route: "/booking-status", element: <BookingStatus /> },
    { route: "/booking-status/:id", element: <BookingStatusDetails /> },
    { route: "/staff/tenchnician", element: <Tenchnician /> },
    { route: "/staff/tenchnician/:id", element: <AddTenchnician /> },
    { route: "/staff/doctor", element: <Doctors /> },
    { route: "/staff/doctor/:id", element: <ActionDoctor /> },
    { route: "/staff/doctor/:id/show", element: <ShowDoctor /> },
    { route: "/staff/tenchnician/:id/show", element: <ShowTenchnician /> },
    { route: "/staff/physician-assistant", element: <PhysicianAssistant /> },
    { route: "/staff/physician-assistant/:id", element: <AddPhysicianAssistant /> },
    { route: "/staff/physician-assistant/:id/show", element: <ShowPhysicianAssistant /> },
    { route: "/staff/bonus", element: <Bonus /> },
    { route: "/staff/bonus/:id", element: <AddBonus /> },
    { route: "/staff/deduction", element: <Deduction /> },
    { route: "/staff/deduction/:id", element: <AddDeduction /> },
    { route: "/staff/holiday", element: <Holiday /> },
    { route: "/staff/holiday/:id", element: <ActionHoliday /> },
    { route: "/staff/department", element: <Departments /> },
    { route: "/staff/department/:id", element: <ActionDepartment /> },
    { route: "/staff/job-title", element: <JobTitle /> },
    { route: "/staff/job-title/:id", element: <ActionJobTitle /> },

    { route: "/warehouse/warehouses", element: <Warehouse /> },
    { route: "/warehouse/items", element: <Items /> },
    { route: "/warehouse/package", element: <Package /> },
    { route: "/warehouse/warehouses/:id/show", element: <WarehouseDetails /> },
    { route: "/warehouse/warehouses/:id", element: <WarehouseAction /> },
    { route: "/warehouse/items/:id", element: <ActionItem /> },
    { route: "/warehouse/package/:id", element: <ActionPackage /> },
    { route: "/warehouse/vendors", element: <Vendors /> },
    { route: "/warehouse/vendors/:id", element: <VendorDetails /> },

    { route: "/accounts/bills", element: <Bills /> },
    { route: "/accounts/bills/:id", element: <ActionBill /> },
    { route: "/accounts/bills/bill-invoice/:id", element: <InvoicePage /> },
    { route: "/maintenance", element: <Maintenance /> },
    { route: "/maintenance/:id", element: <ActionMaintenance /> },
    { route: "/maintenance/maintenance-invoice/:id", element: <MaintenanceInvoice /> },
    { route: "/surgeries/operation-bookings", element: <OperationBooking /> },
    { route: "/surgeries/book-operations", element: <BookOperations /> },
    { route: "/surgeries/canceled-operations", element: <CanceledOperations /> },
    { route: "/booking/normal-patient", element: <NormalPatient /> },
    { route: "/reasons_for_not_booking", element: <ReasonForNotBooking /> },
    { route: "/reasons_for_not_booking/:id", element: <ActionReasonForNotBooking /> },
    {
      route: "/surgeries/operation-bookings/eyebrow-transplant/:id",
      element: <ActionOperationBooking />,
    },
    {
      route: "/surgeries/operation-bookings/eyebrow-transplant-details/:id",
      element: <OperationBookingDetails />,
    },
    {
      route: "/surgeries/operation-bookings/hair-transplant/:id",
      element: <ActionHairTransplant />,
    },
    {
      route: "/surgeries/operation-bookings/hair-transplant-details/:id",
      element: <HairTransplantDetails />,
    },
    {
      route: "/surgeries/surgeries-invoice/:id",
      element: <SurgeriesInvoice />,
    },
    {
      route: "/surgeries/operation-bookings/book-the-operation",
      element: <BookTheOperation />,
    },
    {
      route: "/surgeries/print-pledge/:id",
      element: <PrintPledge />,
    },
    { route: "/accounts/cashier", element: <Cashier /> },
    { route: "/accounts/cashier/:id", element: <ActionCashier /> },
    { route: "/accounts/cashier/:id/show", element: <CashierDetails /> },
    { route: "/setting", element: <Setting /> },
  ];

  const publicRoute = [
    { route: "/", element: <Navigate to="/login" replace /> },
    { route: "/login", element: <Login /> },
    { route: "/forget-password", element: <ForgetPassword /> },
  ];

  const sherdRoute = [];

  return { privateRoute, publicRoute, sherdRoute };
};

export default useRoutes;
