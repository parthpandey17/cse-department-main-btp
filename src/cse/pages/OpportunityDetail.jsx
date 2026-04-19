import { useParams } from "react-router-dom";
import { publicAPI } from "../lib/api.js";
import useDetailData from "../hooks/useDetailData.js";
import DetailPage from "../components/DetailPage.jsx";
import { firstNonEmpty, getPrimitiveDetails } from "../utils/detailFields.js";
import { useDepartment } from "../../department/DepartmentContext";

export default function OpportunityDetail() {
  const { id } = useParams();
  const { deptPath } = useDepartment();
  const { item, loading, error } = useDetailData(publicAPI.getOpportunityById, id);
  const title = item?.title || "Opportunity";

  return (
    <DetailPage
      item={item}
      loading={loading}
      error={error}
      backTo={deptPath("/opportunities")}
      backLabel="Back to Opportunities"
      entityName="Opportunity"
      title={title}
      badge="Opportunity"
      subtitle={item?.description || item?.summary || ""}
      image={firstNonEmpty(item?.image_path, item?.banner_path)}
      imageAlt={title}
      meta={[
        { label: "Type", value: item?.page_group || item?.category || "-" },
        { label: "Block Type", value: item?.block_type || "-" },
      ]}
      additionalFields={getPrimitiveDetails(item, [
        "title",
        "description",
        "summary",
        "image_path",
        "banner_path",
        "content_json",
      ])}
    >
      {item?.content_html && (
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: item.content_html }}
        />
      )}

      {item?.cta_text && item?.cta_url && (
        <a
          href={item.cta_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-semibold text-white"
        >
          {item.cta_text}
        </a>
      )}
    </DetailPage>
  );
}
