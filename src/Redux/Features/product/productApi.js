import { apiSlice } from "../api/apiSlice";



export const productApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllProduct: builder.query({
            query: (count) => `/product?amount=${count}`
        }),
        getProductByCatagory: builder.mutation({
            query: ({ category, currentPage, contentPerPage }) => ({
                url: `/product/category/${category}?currentPage=${currentPage}&size=${contentPerPage}`,
                method: 'POST',
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {

            }
        }),

        /* ---------------------------------------------
            Product Cart Related
        ------------------------------------------------ */

        addProductToCart: builder.mutation({
            query: (data) => ({
                url: '/cart/addProduct',
                method: 'POST',
                body: { data }
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                
                // const pathResult = await dispatch(apiSlice.util.updateQueryData('gettingSingleProductFromCart', ({email:arg.email, id:arg.product._id}), (draft)=>{                    
                //     // selectedProduct
                //     draft._id = arg;
                // } ))
                const pathResult2 = await dispatch(apiSlice.util.updateQueryData('getAllProductCart', undefined, (draft)=>{
                    draft.push(arg);
                }))

                try{
                    const response = await queryFulfilled;
                }catch(err){
                    console.log(err);
                    pathResult2.undo();
                }
            }
        }),
        getAllProductCart: builder.query({
            query: () => '/cart/getAllProduct'
        }),

        /* // --- this query is for avoiding adding multiple product at 'Shop' page. It will check if the product that has been selected by user is already in his cart */
        gettingSingleProductFromCart: builder.query({
            query: ({ email, id }) => `/cart/singleProduct?email=${email}&id=${id}`
        }),
        
        // --- Getting all the cart product for individual user
        getUserAllProduct : builder.query({
            query : (email) => `/cart/user/${email}`
        }),

        // --- delete a product for a user
        deleteProductOfUser : builder.mutation({
            query : ({email, id}) => ({
                url : `/cart/user/delete?email=${email}&id=${id}`,
                method : 'DELETE'
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                
                const pathResult = await dispatch(apiSlice.util.updateQueryData('getUserAllProduct', arg.email, (draft)=>{                    
                    // selectedProduct
                    const deletedProduct = draft.find(index=>index._id === arg.id);
                    const deletedIndex = draft.indexOf(deletedProduct);

                    draft.splice(deletedIndex, 1);
                } ))

                try{
                    const response = await queryFulfilled;
                }catch(err){
                    console.log(err);
                    pathResult.undo();
                }
            }
        })


    })
})



export const { useGetAllProductQuery, useGetProductByCatagoryQuery, useGetProductByCatagoryMutation, useAddProductToCartMutation, useGetAllProductCartQuery, useGettingSingleProductFromCartQuery, useGetUserAllProductQuery, useDeleteProductOfUserMutation } = productApi; 