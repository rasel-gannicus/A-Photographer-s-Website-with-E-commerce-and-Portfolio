import { apiSlice } from "../api/apiSlice";


export const serviceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addServiceToDb: builder.mutation({
            query: (data) => ({
                url: '/services/add',
                method: 'PUT',
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                // --- optimistic update
                const response = await queryFulfilled;
                const pathResult = dispatch(apiSlice.util.updateQueryData('getServiceCart', arg.email, (draft) => {
                    draft.push(arg);
                }))
            }
        }),

        updateService: builder.mutation({
            query: (data) => ({
                url: '/services/update',
                method: 'PATCH',
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                // --- pessimistic update
                console.log(arg)
                try{
                    const res = await queryFulfilled;
                    if(res?.data?.modifiedCount>0){
                        const pathResult = await dispatch(apiSlice.util.updateQueryData('getServiceCart', arg.email, (draft)=>{
                            let modifiedItem = draft.find(index => index.serviceId == arg.serviceId);
                            modifiedItem.status = arg.status;
                            modifiedItem.time = arg.time;
                            modifiedItem.date = arg.date ;
                        }))
                    }
                }catch(err){
                    console.log(err);
                }
            }
        }),

        getServiceCart: builder.query({
            query: (email) => `/cart/services/${email}`
        }),

        deletingAService: builder.mutation({
            query: ({ id, email }) => ({
                url: `/cart/service/delete/${id}`,
                method: 'DELETE'
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                //--- optimistic update
                const pathResult = dispatch(apiSlice.util.updateQueryData('getServiceCart', arg.email, (draft) => {

                    const deletedService = draft.find(index => index._id == arg.id);
                    const deletedIndex = draft.indexOf(deletedService);

                    draft.splice(deletedIndex, 1);
                }))

                try {
                    const response = await queryFulfilled;
                } catch (err) {
                    console.log(err);
                    pathResult.undo();
                }
            }
        })
    })
})

export const { useAddServiceToDbMutation, useGetServiceCartQuery, useDeletingAServiceMutation, useUpdateServiceMutation } = serviceApi