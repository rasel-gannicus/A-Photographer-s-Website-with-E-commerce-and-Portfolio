import React, { useEffect } from "react";
import "./ShopProuduct.css";
import {
  useAddProductToCartMutation,
  useGetAllProductCartQuery,
  useGettingSingleProductFromCartQuery,
} from "../../../../Redux/Features/product/productApi";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from "../../../../Utilities/firebase.init";
import { errorMessage, successMessage } from "../../../../Utilities/popupMsg";
import { useDispatch, useSelector } from "react-redux";
import { activeModal } from "../../../../Redux/Features/modal/modalSlice";

const ShopProuduct = (props) => {
  const { img, catagory, price, _id } = props.index;

  // --- activating modal with redux
  const modalStatus = useSelector((state) => state.modal.modalShow);
  // console.log(modalStatus);
  const dispatch = useDispatch();

  const openModal = (productId) => {
    dispatch(activeModal({productId}));
  };

  // --- getting user Information from Firebase
  const [user] = useAuthState(auth);

  // --- getting info about every single product from cart from database
  const {
    data: singleProductFromCart,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useGettingSingleProductFromCartQuery(
    { email: user?.email, id: _id },
    { skip: !user?.email }
  ); //--- this query will not be triggered until user is logged in

  // --- adding product to users cart and database
  const [
    addToCart,
    {
      data: addedData,
      isLoading: addingLoading,
      isError: addingIsError,
      error: addingError,
    },
  ] = useAddProductToCartMutation();

  function addProduct() {
    if (user?.email) {
      if (isSuccess) {
        addToCart({
          product: props.index,
          email: user.email,
          quantity: 1,
        });
      } else {
        errorMessage(
          "There was an error when searching for duplicate products! ",
          4000
        );
      }
    } else {
      errorMessage("Log in first to add to cart");
    }
  }

  // --- deciding what to show while adding data to database
  if (addingLoading && !addingIsError) {
    // console.log('Loading...')
  }
  if (!addingLoading && addingIsError) {
    // console.log(addingError);
    errorMessage(addingError.data.message);
  }
  useEffect(() => {
    if (addedData) {
      if (addedData.insertedId) {
        successMessage("Product Added");
        refetch();
      }
    }
  }, [refetch, addedData]);

  return (
    <div className="" >
      <div className="product-img-parent">
        <div className="product-img">
          <img src={img} alt="" />
        </div>
        <div className="product-first-div">
          <button
            onClick={() => addProduct()}
            disabled={
              singleProductFromCart?.product?._id === _id || addingLoading
            }
            className={
              singleProductFromCart?.product?._id === _id ? "added-button" : ""
            }
          >
            {singleProductFromCart?.product?._id === _id
              ? "Added"
              : "Add to Cart"}
          </button>
        </div>
        <div className="product-second-div">
          <button onClick={() => openModal(_id)}>View Details</button>
        </div>
        <div className="price">
          <p>$ {price} </p>
        </div>
      </div>

      {/* <div className="product-footer-div">
        <button>Buy Now</button>
        <button>Add to Wishlist</button>
      </div> */}
    </div>
  );
};

export default ShopProuduct;
