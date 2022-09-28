(async () => {
  // constants
  const SCRIPT_DATA_ELEMENT_IDENTIFIER = "__NEXT_DATA__";
  const SERVER_URL = "https://nc-server.onrender.com";
  const MAYER_SERVER_URL = "https://api-online.myer.com.au";
  const PRODUCTS_ENDPOINT = "/products";
  const CATEGORY_ENDPOINT = "/v2/category/tree/top";
  const METHODS = {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
  };

  // request handler function
  const requestHandler = async (url, method, data) => {
    try {
      const requestObject = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      if (data) requestObject.body = JSON.stringify(data);

      const res = await fetch(url, requestObject);

      return res.json();
    } catch (error) {
      console.error(error);
    }
  };

  // post product data
  const postProductData = async (data) => {
    const url = `${SERVER_URL}${PRODUCTS_ENDPOINT}`;

    const result = await requestHandler(url, METHODS.POST, data);
    return result;
  };

  // get category list
  const getCategoryList = async () => {
    const url = `${MAYER_SERVER_URL}${CATEGORY_ENDPOINT}`;

    const result = await requestHandler(url, METHODS.GET);
    return result;
  };

  // script tag with __NEXT_DATA__ identifier holds the products data
  const productDataScriptEl = document.getElementById(
    SCRIPT_DATA_ELEMENT_IDENTIFIER
  );

  if (!productDataScriptEl || !productDataScriptEl.innerHTML) return;

  const productPageMetaData = JSON.parse(productDataScriptEl.innerHTML);

  if (
    !productPageMetaData ||
    !productPageMetaData.props ||
    !productPageMetaData.props.initialState
  )
    return;

  const { productDetails } = productPageMetaData.props.initialState;

  const {
    product,
    productPrice,
    attributes: { linkedProducts },
  } = productDetails;

  if (!product || !product.result) return;

  const { id, internalId, title, variants, isAvailable } = product.result;

  // preparing the product data
  // we kept linkedProducts, variants as extra may need in future
  const productData = {
    productId: id,
    productInternalId: internalId,
    title,
    isAvailable,
    productPrice,
    variants,
    linkedProducts,
  };

  try {
    // post request with data
    await postProductData(productData);
    const categoryList = await getCategoryList();
    // category data will be posted to original server from here
  } catch (error) {
    console.error(error);
  }
})();
