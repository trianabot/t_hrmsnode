
const CategoryModel = require('../../models/category.model');
//Register


exports.addCategory= (req,res)=>{
  
    const newCategory = new CategoryModel({
            CategoryName: req.body.CategoryName
    });
    newCategory.save((err,data) =>{
        if(!err){
            console.log(data);
            res.status(200).send(data);
        }
        else{
            console.log(err);
        }
    })

    
}


// exports.getCategories=  async(req,res) =>{    
//     const categories =  CategoryModel.find();
//     res.json(categories);
// }

exports.getCategories =(req,res,) =>{
    CategoryModel.find(function (err, data) {
        if(err){
            console.log(err);
            return res.send(500, 'Something Went wrong with Retrieving data');
        }
        else {
            res.status(200).send(data);
        }
    });
}



// exports.deleteCategory = async(req, res)=>{
//     CategoryModel.findByIdAndRemove(req.params.id);
//     res.json({status:'Category Deleted'});
// }

// exports.removeCategory = (req,res) =>{
//     CategoryModel.remove( { } );
//     res.json({status:"category all deleted"});

// }

//exports.delete('/remove/:id', function(req, res){

exports.removeCategory = (req,res) =>{ 
	CategoryModel.remove({_id: req.params.id}, 
	   function(err){
		if(err) res.json(err);
		else    res.json({status:"remove the record"});
	});

}


// Delete a note with the specified noteId in the request
exports.deleteCategory = (req, res) => {
    CategoryModel.findByIdAndRemove(req.params.id)
    .then(category => {
        if(!category) {
            return res.status(404).send({
                message: "category not found with id " + req.params.id
            });
        }
        res.send({message: "category deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "category not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Could not delete category with id " + req.params.id
        });
    });
};

