import { useContext } from "react";
import { AppContext } from "../AppContext";
import { assets } from "../assets/assets";
import { getImageUrl } from "../utils/imageUrl";

const ProductCard = ({ product }) => {
  const { navigate, addToCart, cartItems, removeFromCart, backendUrl } = useContext(AppContext);

  if (!product) return null; // Safeguard if product is undefined

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category?.toLowerCase()}/${product._id}`);
      }}
      className="border border-gray-500/20 rounded-xl md:rounded-md px-2 md:px-4 py-2 md:py-3 bg-white w-full md:max-w-[224px] flex flex-col h-full mx-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="group h-30 md:h-40 max-h-40 overflow-hidden bg-gray-50 rounded-lg md:rounded-md mb-1.5 md:mb-2">
        <img
          className="group-hover:scale-105 transition w-full h-full object-cover"
          src={getImageUrl(product.images?.[0], backendUrl)}
          alt={product.name || "Product"}
        />
      </div>

      <div className="text-gray-500/60 text-xs md:text-sm flex flex-col flex-grow">
        <p className="text-[9px] md:text-[10px] uppercase tracking-wider">{product.category}</p>
        <p className="text-gray-700 font-medium text-xs md:text-base truncate w-full mt-0.5">
          {product.name}
        </p>
        <div className="flex items-center gap-0.5 mt-1">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="rating"
                className="w-2 md:w-3.5"
              />
            ))}
          <p className="text-[9px] md:text-xs">(4)</p>
        </div>
        <div className="flex items-center justify-between mt-2 md:mt-3 gap-1">
          <p className="text-xs md:text-lg font-semibold text-indigo-500 whitespace-nowrap">
            ₹{product.offerPrice}{" "}
            <span className="text-gray-400 text-[9px] md:text-xs line-through font-normal">
              ₹{product.price}
            </span>
          </p>

          <div className="text-indigo-500" onClick={(e) => e.stopPropagation()}>
            {!cartItems?.[product._id] ? (
              <button
                className="flex items-center justify-center gap-0.5 md:gap-1 bg-indigo-100 border border-indigo-300 w-[46px] md:w-[80px] h-[24px] md:h-[34px] rounded text-indigo-600 text-[10px] md:text-sm font-semibold"
                onClick={() => addToCart(product._id)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="md:w-3.5 md:h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0"
                    stroke="#615fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-0.5 md:gap-2 w-[52px] md:w-20 h-[24px] md:h-[34px] bg-indigo-500/25 rounded select-none text-[10px] md:text-sm">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer font-bold px-1 md:px-2 h-full flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-4 md:w-5 text-center font-semibold">{cartItems[product._id]}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="cursor-pointer font-bold px-1 md:px-2 h-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
