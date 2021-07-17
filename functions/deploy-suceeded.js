/* Triggered when Netlify finishes deploying a site. */
// Non utilisé - Test only
exports.handler = async (event, context) => {
 


  return {
    statusCode: 200,
    body: JSON.stringify({message: "Fonction opérationnelle"})
  }
}