import "./TypeManagement.css";
import ManagementType from "../components/TypeManagement";

const categories = [
  "Menjaga Alam Sekitar",
  "Akademik",
  "Khidmat Masyarakat",
  "Amal",
  "Moral",
];

export default function SahsiahPage() {
  return (
    <ManagementType
      title="Pengurusan Sahsiah"
      fetchUrl="http://72.62.65.202:8080/api/sahsiah/type/"
      saveUrl={(id) =>
        id
          ? `http://72.62.65.202:8080/api/sahsiah/type/${id}/`
          : "http://72.62.65.202:8080/api/sahsiah/type/"
      }
      deleteUrl={(id) => `http://72.62.65.202:8080/api/sahsiah/type/${id}/`}
      categories={categories}
    />
  );
}
