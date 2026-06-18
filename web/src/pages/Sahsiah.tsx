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
      fetchUrl="http://localhost:8080/api/sahsiah/type/"
      saveUrl={(id) =>
        id
          ? `http://localhost:8080/api/sahsiah/type/${id}/`
          : "http://localhost:8080/api/sahsiah/type/"
      }
      deleteUrl={(id) => `http://localhost:8080/api/sahsiah/type/${id}/`}
      categories={categories}
    />
  );
}
