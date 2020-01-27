const express = require('express');
const router = express.Router();


const category_controller= require('../controllers/admin/categorycontroller');

router.post('/newCategory', category_controller.addCategory);
router.get('/categories',category_controller.getCategories);
router.delete('/deleteCategory/:id',category_controller.deleteCategory);
router.delete('/remove/:id', category_controller.removeCategory );



module.exports = router;
