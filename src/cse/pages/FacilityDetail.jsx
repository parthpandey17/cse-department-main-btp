import { useParams } from "react-router-dom";
import { publicAPI } from "../lib/api.js";
import useDetailData from "../hooks/useDetailData.js";
import DetailPage from "../components/DetailPage.jsx";
import { firstNonEmpty, getPrimitiveDetails } from "../utils/detailFields.js";
import { useDepartment } from "../../department/DepartmentContext";

export default function FacilityDetail() {
  const { id } = useParams();
  const { deptPath } = useDepartment();
  const { item, loading, error } = useDetailData(publicAPI.getFacilityById, id);
  const title = item?.title || item?.name || "Facility";

  return (
    <DetailPage
      item={item}
      loading={loading}
      error={error}
      backTo={deptPath("/facilities")}
      backLabel="Back to Facilities"
      entityName="Facility"
      title={title}
      badge="Facility"
      subtitle={item?.description || item?.summary || ""}
      image={firstNonEmpty(item?.image_path, item?.banner_path, item?.photo_path)}
      imageAlt={title}
      meta={[
        { label: "Category", value: item?.category || "-" },
        { label: "Status", value: item?.is_active ? "Active" : "-" },
      ]}
      additionalFields={getPrimitiveDetails(item, [
        "title",
        "name",
        "description",
        "summary",
        "category",
        "image_path",
        "banner_path",
        "photo_path",
      ])}
    />
  );
}
