import React, { useCallback, useEffect, useMemo, useState } from "react";
import BreadCrumb from "Common/BreadCrumb";
import debounce from "lodash.debounce";

// icons
import {
  Boxes,
  Loader,
  Search,
  PackageCheck,
  PackageX,
  Plus,
  MoreHorizontal,
  Trash2,
  FileEdit,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Dropdown } from "Common/Components/Dropdown";
import DeleteModal from "Common/DeleteModal";

// react-redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import {
  getReceiptReturnList as onGetReceiptReturnList,
  deleteReceiptReturn as onDeleteReceiptReturn,
} from "slices/thunk";
import { ToastContainer } from "react-toastify";
import { PaginationState } from "@tanstack/react-table";
import TableCustom from "Common/TableCustom";
import { formatMoney } from "helpers/utils";
import ShowBarcodeModal from "../components/ShowBarcodeModal";
import { TimePicker } from "Common/Components/TimePIcker";
import { getDate } from "helpers/date";

const RECEIPT_STATUS = {
  DRAFT: "draft",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const ReceiptReturnList = () => {
  const dispatch = useDispatch<any>();

  const selectDataList = createSelector(
    (state: any) => state.ReceiptReturn,
    (state) => ({
      data: state?.data || [],
      pagination: state?.pagination || {},
    })
  );

  const { data: receipts, pagination } = useSelector(selectDataList);

  const [eventData, setEventData] = useState<any>();
  const [filters, setFilters] = useState<Record<string, string | number>>({});

  const [paginationData, setPaginationData] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pagination.limit || 10,
  });

  const fetchReceipts = useCallback(() => {
    dispatch(
      onGetReceiptReturnList({
        page: paginationData.pageIndex + 1,
        limit: paginationData.pageSize,
        ...filters,
      })
    );
  }, [dispatch, filters, paginationData]);

  // Get Data
  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Modals
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState<boolean>(false);

  const showBarcodeModalToggle = () => setShowBarcodeModal(!showBarcodeModal);
  const deleteToggle = () => setDeleteModal(!deleteModal);

  // Delete Data
  const onClickDelete = (cell: any) => {
    setDeleteModal(true);

    if (cell.id) {
      setEventData(cell);
    }
  };

  const handleDelete = () => {
    if (eventData) {
      dispatch(onDeleteReceiptReturn, eventData.id);
      setDeleteModal(false);
    }
  };

  const onClickShowBarcode = (cell: any) => {
    setShowBarcodeModal(true);

    if (cell.receiptNumber) {
      setEventData(cell);
    }
  };

  // Search Data
  const filterSearchData = (e: any) => {
    const keyword = e.target.value;
    setFilters((prev) => ({
      ...prev,
      keyword,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      keyword: "",
      returnDate: "",
      status: "",
      page: 1,
    }));
  };

  const [activeTab, setActiveTab] = useState("1");

  const toggleTab = (tab: any, type: any) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      const status = type === "all" ? "" : type;

      setFilters((prev) => ({
        ...prev,
        status,
        page: 1,
      }));
    }
  };

  const columns = useMemo(
    () => [
      {
        enableSorting: false,
        id: "checkAll",
        cell: (cell: any) => {
          return (
            <div className="flex items-center h-full">
              <input
                id={"Checkbox" + cell.row.original.id}
                className="size-4 cursor-pointer bg-white border border-slate-200 checked:bg-none dark:bg-zink-700 dark:border-zink-500 rounded-sm appearance-none arrow-none relative after:absolute after:content-['\eb7b'] after:top-0 after:left-0 after:font-remix after:leading-none after:opacity-0 checked:after:opacity-100 after:text-custom-500 checked:border-custom-500 dark:after:text-custom-500 dark:checked:border-custom-800"
                type="checkbox"
              />
            </div>
          );
        },
      },
      {
        header: "Mã phiếu",
        accessorKey: "receiptNumber",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cell: any) => (
          <>
            <Link
              to={`/receipt-return/update?id=${cell.row.original.id}`}
              className="transition-all duration-150 ease-linear order_id text-custom-500 hover:text-custom-600"
            >
              {cell.getValue()}
            </Link>
          </>
        ),
      },
      {
        header: "Thời gian trả",
        accessorKey: "returnDate",
        enableColumnFilter: false,
      },
      {
        header: "Tên",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Số lượng trả",
        accessorKey: "quantity",
        enableColumnFilter: false,
      },
      {
        header: "Tổng tiền",
        accessorKey: "totalAmount",
        enableColumnFilter: false,
        cell: (cell: any) => formatMoney(cell.getValue()),
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell: any) => <Status item={cell.getValue()} />,
      },
      {
        header: "Action",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell: any) => (
          <Dropdown className="relative z-dropdown">
            <Dropdown.Trigger
              id="orderAction1"
              data-bs-toggle="dropdown"
              className="flex items-center justify-center size-[30px] p-0 text-slate-500 btn bg-slate-100 hover:text-white hover:bg-slate-600 focus:text-white focus:bg-slate-600 focus:ring focus:ring-slate-100 active:text-white active:bg-slate-600 active:ring active:ring-slate-100 dark:bg-slate-500/20 dark:text-slate-400 dark:hover:bg-slate-500 dark:hover:text-white dark:focus:bg-slate-500 dark:focus:text-white dark:active:bg-slate-500 dark:active:text-white dark:ring-slate-400/20"
            >
              <MoreHorizontal className="size-3" />
            </Dropdown.Trigger>
            <Dropdown.Content
              placement={cell.row.index ? "top-end" : "right-end"}
              className="absolute z-50 py-2 mt-1 ltr:text-left rtl:text-right list-none bg-white rounded-md shadow-md min-w-[10rem] dark:bg-zink-600"
              aria-labelledby="orderAction1"
            >
              <li>
                <a
                  href="#!"
                  className="block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
                  onClick={() => {
                    const data = cell.row.original;
                    onClickShowBarcode(data);
                  }}
                >
                  <Eye className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{" "}
                  <span className="align-middle">In tem mã</span>
                </a>
              </li>
              <li>
                <Link
                  to={`/receipt-return/update?id=${cell.row.original.id}`}
                  data-modal-target="addOrderModal"
                  className="block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
                >
                  <FileEdit className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{" "}
                  <span className="align-middle">Cập nhật</span>
                </Link>
              </li>
              <li>
                <Link
                  to="#!"
                  className="block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
                  onClick={() => {
                    const data = cell.row.original;
                    onClickDelete(data);
                  }}
                >
                  <Trash2 className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{" "}
                  <span className="align-middle">Xóa</span>
                </Link>
              </li>
            </Dropdown.Content>
          </Dropdown>
        ),
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <BreadCrumb title="Danh sách phiếu trả " pageTitle="Receipt Return" />
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
      />
      {eventData?.receiptNumber && (
        <ShowBarcodeModal
          barcode={eventData.receiptNumber}
          show={showBarcodeModal}
          onClose={showBarcodeModalToggle}
        />
      )}
      <ToastContainer closeButton={false} limit={1} />

      <div className="card" id="ordersTable">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <div className="relative">
                <input
                  type="text"
                  className="ltr:pl-8 rtl:pr-8 search form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                  placeholder="Tìm kiếm theo mã phiếu, tên ..."
                  autoComplete="off"
                  onChange={debounce(filterSearchData, 700)}
                />
                <Search className="inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <TimePicker
                value={filters.returnDate as string}
                onChange={([date]) => {
                  setFilters((prev) => ({
                    ...prev,
                    returnDate: getDate(date).toISOString(),
                    page: 1,
                  }));
                }}
                props={{
                  placeholder: "Chọn ngày trả hàng",
                  id: "returnDate",
                }}
              />
            </div>
            <button
              type="button"
              className="text-red-500 bg-white btn hover:text-red-500 hover:bg-red-100 focus:text-red-500 focus:bg-red-100 active:text-red-500 active:bg-red-100 dark:bg-zink-700 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10 dark:active:bg-red-500/10"
              onClick={resetFilters}
            >
              Xóa lọc
              <i className="align-baseline ltr:pl-1 rtl:pr-1 ri-close-line"></i>
            </button>
            <div className="lg:col-span-2 lg:col-start-11">
              <div className="ltr:lg:text-right rtl:lg:text-left">
                <Link
                  to="/receipt-return/create"
                  className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                >
                  <Plus className="inline-block size-4" />{" "}
                  <span className="align-middle">Tạo phiếu</span>
                </Link>
              </div>
            </div>
          </div>

          <ul className="flex flex-wrap w-full mt-5 text-sm font-medium text-center text-gray-500 nav-tabs">
            <li className={`group ${activeTab === "1" && "active"}`}>
              <Link
                to="#"
                data-tab-toggle
                data-target="allOrders"
                className="inline-block px-4 py-1.5 text-base transition-all duration-300 ease-linear rounded-md text-slate-500 dark:text-zink-200 border border-transparent group-[.active]:bg-custom-500 group-[.active]:text-white dark:group-[.active]:text-white hover:text-custom-500 dark:hover:text-custom-500 active:text-custom-500 dark:active:text-custom-500 -mb-[1px]"
                onClick={() => {
                  toggleTab("1", "all");
                }}
              >
                <Boxes className="inline-block size-4 ltr:mr-1 rtl:ml-1" />{" "}
                <span className="align-middle">Tất cả</span>
              </Link>
            </li>
            <li className={`group ${activeTab === "2" && "active"}`}>
              <Link
                to="#"
                data-tab-toggle
                data-target="pendingOrder"
                className="inline-block px-4 py-1.5 text-base transition-all duration-300 ease-linear rounded-md text-slate-500 dark:text-zink-200 border border-transparent group-[.active]:bg-custom-500 group-[.active]:text-white dark:group-[.active]:text-white hover:text-custom-500 dark:hover:text-custom-500 active:text-custom-500 dark:active:text-custom-500 -mb-[1px]"
                onClick={() => {
                  toggleTab("2", "processing");
                }}
              >
                <Loader className="inline-block size-4 ltr:mr-1 rtl:ml-1" />{" "}
                <span className="align-middle">Đang xử lý</span>
              </Link>
            </li>
            <li className={`group ${activeTab === "3" && "active"}`}>
              <Link
                to="#"
                data-tab-toggle
                data-target="deliveredOrder"
                className="inline-block px-4 py-1.5 text-base transition-all duration-300 ease-linear rounded-md text-slate-500 dark:text-zink-200 border border-transparent group-[.active]:bg-custom-500 group-[.active]:text-white dark:group-[.active]:text-white hover:text-custom-500 dark:hover:text-custom-500 active:text-custom-500 dark:active:text-custom-500 -mb-[1px]"
                onClick={() => {
                  toggleTab("3", "completed");
                }}
              >
                <PackageCheck className="inline-block size-4 ltr:mr-1 rtl:ml-1" />{" "}
                <span className="align-middle">Hoàn thành</span>
              </Link>
            </li>
            <li className={`group ${activeTab === "4" && "active"}`}>
              <Link
                to="#"
                data-tab-toggle
                data-target="cancelledOrders"
                className="inline-block px-4 py-1.5 text-base transition-all duration-300 ease-linear rounded-md text-slate-500 dark:text-zink-200 border border-transparent group-[.active]:bg-custom-500 group-[.active]:text-white dark:group-[.active]:text-white hover:text-custom-500 dark:hover:text-custom-500 active:text-custom-500 dark:active:text-custom-500 -mb-[1px]"
                onClick={() => {
                  toggleTab("4", "cancelled");
                }}
              >
                <PackageX className="inline-block size-4 ltr:mr-1 rtl:ml-1 " />{" "}
                <span className="align-middle">Hủy bỏ</span>
              </Link>
            </li>
          </ul>

          {receipts && receipts.length > 0 ? (
            <TableCustom
              isPagination={true}
              columns={columns || []}
              data={receipts || []}
              totalData={pagination.totalItems}
              pageCount={pagination.totalPages}
              pagination={paginationData}
              setPaginationData={setPaginationData}
              customPageSize={10}
              divclassName="mt-5 overflow-x-auto"
              tableclassName="w-full whitespace-nowrap"
              theadclassName="ltr:text-left rtl:text-right bg-slate-100 dark:bg-zink-600"
              thclassName="px-3.5 py-2.5 font-semibold text-slate-500 border-b border-slate-200 dark:border-zink-500 dark:text-zink-200"
              tdclassName="px-3.5 py-2.5 border-y border-slate-200 dark:border-zink-500"
              PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
            />
          ) : (
            <div className="noresult">
              <div className="py-6 text-center">
                <Search className="size-6 mx-auto text-sky-500 fill-sky-100 dark:sky-500/20" />
                <h5 className="mt-2 mb-1">Sorry! No Result Found</h5>
                <p className="mb-0 text-slate-500 dark:text-zink-200">
                  We've searched more than 299+ orders We did not find any
                  orders for you search.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ReceiptReturnList;

const Status = ({ item }: any) => {
  switch (item) {
    case RECEIPT_STATUS.DRAFT:
      return (
        <span className="delivery_status px-2.5 py-0.5 text-xs inline-block font-medium rounded border bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-500/20 dark:border-slate-500/20">
          Phiếu nháp
        </span>
      );
    case RECEIPT_STATUS.PROCESSING:
      return (
        <span className="delivery_status px-2.5 py-0.5 text-xs inline-block font-medium rounded border bg-purple-100 border-purple-200 text-purple-500 dark:bg-purple-500/20 dark:border-purple-500/20">
          Đang xử lý
        </span>
      );
    case RECEIPT_STATUS.COMPLETED:
      return (
        <span className="delivery_status px-2.5 py-0.5 text-xs inline-block font-medium rounded border bg-green-100 border-green-200 text-green-500 dark:bg-green-500/20 dark:border-green-500/20">
          Đã hoàn thành
        </span>
      );
    case RECEIPT_STATUS.CANCELLED:
      return (
        <span className="delivery_status px-2.5 py-0.5 text-xs inline-block font-medium rounded border bg-red-100 border-red-200 text-red-500 dark:bg-red-500/20 dark:border-red-500/20">
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="delivery_status px-2.5 py-0.5 text-xs inline-block font-medium rounded border bg-green-100 border-green-200 text-green-500 dark:bg-green-500/20 dark:border-green-500/20">
          {item}
        </span>
      );
  }
};