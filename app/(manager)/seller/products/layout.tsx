const ProductsLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="space-y-6">
            {children}
        </div>
    )
}

export default ProductsLayout 