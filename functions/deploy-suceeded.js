/* Triggered when Netlify finishes deploying a site. */
exports.handler = async (event, context) => {
 


  return {
    statusCode: 200,
    body: JSON.stringify({message: "Fonction opérationnelle"})
  }
}