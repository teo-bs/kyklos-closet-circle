
import { useParams } from "react-router-dom";

const ListingDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold p-4">Item Details</h1>
      <p className="text-gray-600 px-4">Listing ID: {id}</p>
    </div>
  );
};

export default ListingDetail;
