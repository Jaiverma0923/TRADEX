export const successResponse=(
    message:string,status=200
)=>{
    return Response.json(
        {
            success:true,
            message,
        },
        {
            status
        }
    )
}
export const errorResponse = (
  message: string, status = 500
) => {
  return Response.json(
    {
      success: false,
      message,
    },
    { 
        status
    }
  );
};