var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');;
var multer = require('multer');
var path = require('path');
var Doc = mongoose.model('Doc');
var FranchiseeType = mongoose.model('FranchiseeType');
var Library = mongoose.model('Library');
var FranchiseeTypeList = mongoose.model('FranchiseeTypeList');
var Application = mongoose.model('Application');
var Franchisee = mongoose.model('Franchisee');
var _ = require('lodash');
var nodemailer = require('nodemailer');
var utils = require('../../common/utils');
var KycUploads = mongoose.model('KycUploads');
var Versions = mongoose.model('Versions');
var Reasons = mongoose.model('Reasons');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var Franchisee = mongoose.model('Franchisee');
var Partner = mongoose.model('Partner');
var bCrypt = require('bcrypt-nodejs');
var franchisee = require('../../routes/franchisees/franchisee');
var saveActivityTracker = franchisee.saveActivity;
aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
});
//carzwta
var s0 = new aws.S3({})
var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'carzdev',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname)
        }
    })
});
// To upload files kyc
var cpUpload = upload.fields([{ name: 'file_upload', maxCount: 50 }, { name: 'imgFields', maxCount: 20 }])
router.post('/upload_file', cpUpload, function (req, res) {
    var file_details = (req.body);
    var files = [];
    Doc.find({}, function (err, kyc) {
        if (err) {
            return res.send(err);
        }
        else {
            var file = [];
            var getNumber = 0;
            var length = req.files.file_upload.length;
            file = req.files.file_upload;
            for (var i = 0; i < file.length; i++) {
                var document = new Doc();
                document.path = file[i].location;
                document.key = file[i].key;
                document.file_name = file[i].originalname;
                if (file[i].mimetype == "application/pdf") {
                    document.image_type = "pdf";
                }
                if (file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i].mimetype == "image/jpeg") {
                    document.image_type = "image";
                }
                document.is_provide = req.body.is_provide;
                document.stage_name = req.body.stage_name;
                document.date_uploaded = Date.now();
                document.franchisee_id = req.body.franchisee_id;
                files.push(document);
            }
            for (var i = 0; i < files.length; i++) {
                getNumber = getNumber + 1;
                files[i].save(function (err, files) {
                    if (err) {
                        return res.send(err);
                    }
                    else {
                        if (parseInt(length) == parseInt(getNumber)) {
                            res.send({
                                state: 200,
                                status: 'success',
                                message: "file uploaded successfully !"
                            });
                        }
                    }
                })
            }
        }
    });
});
//to get uploded files
router.get('/get_uploaded_files/:franchisee_Id/:stage_name', function (req, res) {
    Doc.find({ uploaded_status: req.params.uploaded_status, franchisee_id: req.params.franchisee_id, stage_name: req.params.stage_name }, function (err, file) {
        if (err) {
            res.send({
                message: "Something went wrong.",
                state: "error"
            }, 500);
        }
        if (file.length == 0) {
            res.send({
                message: "No file are uploaded.",
                state: "failure"
            }, 201);
        }
        if (file) {
            res.send({
                file: file,
                state: "success"
            }, 200);
        }
    });
});
router.get('/get_business_type_list_by_franchisor/:franchisor_id', async function (req, res) {
    try {
        var version_id = '';
        await Versions.findOne({ version_type: 'kyc_docs', default: true, franchisor_id: req.params.franchisor_id }, async function (err, version) {
            if (version) {

                await FranchiseeType.find({ version_id: version._id, franchisor_id: req.params.franchisor_id }, function (err, type) {
                    console.log(type, "version_id of default");
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong.We are looking into it."
                        }, 500);
                    }
                    else {

                        return res.send({
                            state: "success",
                            data: type
                        }, 200);
                    }

                })
            }
            else {
                return res.send({
                    state: "failure",
                    message: "Business Types are not defined or May be Version is not default in Settings"
                }, 201);
            }

        });

    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
router.get('/get_business_type/:version_id/:franchisor_id', function (req, res) {
    try {
        FranchiseeType.find({ version_id: req.params.version_id, franchisor_id: req.params.franchisor_id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            else {
                // Versions.find({franchisor_id: req.params.franchisor_id, version_type: 'kyc_docs', default: true}, function (err, version){
                //     console.log(version, '124');
                //     if(err){
                //     return res.send({
                //         state: "error",
                //         message: err
                //     }, 500);
                //     }
                // })
                return res.send({
                    state: "success",
                    data: type
                }, 200);
            }

        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
//function for  business types
function get_business_types(req, res, version_id) {
    console.log(version_id, "139");
    FranchiseeType.find({ version_id: version_id }, function (err, ques) {
        if (err) {
            return res.send({
                state: "err",
                message: "Something went wrong.We are looking into it."
            }, 500);
        }
        else {
            return res.send({
                state: "success",
                data: type
            }, 200);
        }
    })
}
// router.get('/get_bussiness_type/:version_id/:franchisor_id',function(req,res){
//     try{
//         FranchiseeType.find({version_id: req.params.version_id},function(err,type){
//             if(err){
//                 return res.send({
//                     state:"err",
//                     message:"Something went wrong.We are looking into it."
//                 },500);
//             }
//             else{
//                 Versions.find({franchisor_id: req.params.franchisor_id, version_type: 'kyc_docs', default: true}, function (err, version){
//                     console.log(version, '125');
//                     if(err){
//                     return res.send({
//                         state: "error",
//                         message: err
//                     }, 500);
//                     }
//                 })
//                 return res.send({
//                     state:"success",
//                     data:type
//                 },200);
//             }
//         })
//     }
//     catch(err){
//         res.send({
//             state:"error",
//             message:err
//         },500);
//     }
// });
router.get('/get_business_types_list/:version_id', function (req, res) {
    try {
        FranchiseeTypeList.find({ version_id: req.params.version_id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            else {
                return res.send({
                    state: "success",
                    FranchiseeType: type
                }, 200);
            }
        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
router.post('/set_business_type', utils.authenticated, function (req, res) {
    try {
        FranchiseeType.findOne({ 'bussiness_type_name': { $regex: new RegExp(req.body.bussiness_type_name, 'i') }, version_id: req.body.version_id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (type) {
                return res.send({
                    state: "failure",
                    message: "name already exists."
                }, 201);
            }
            else {
                var document_list = new FranchiseeType();
                document_list.description = req.body.description;
                document_list.franchisor_id = req.body.franchisor_id;
                document_list.version_id = req.body.version_id;
                document_list.bussiness_type_name = req.body.bussiness_type_name;
                document_list.version_id = req.body.version_id;
                document_list.save(function (err, document_list) {
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong.We are looking into it."
                        }, 500);
                    }
                    else {
                        return res.send({
                            state: "success",
                            message: "Successfully added in the array.",
                            data: document_list
                        }, 200);
                    }
                })
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
router.put('/update_franchisee_type', function (req, res) {
    var franchiseeTypeEdit = req.body;
    try {
        FranchiseeType.findById({ _id: franchiseeTypeEdit._id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong. We are looking into it."
                }, 500);
            }
            if (!type) {
                res.send({
                    state: "failure",
                    message: "No types found"
                }, 201);
            }
            if (type) {
                if (type.bussiness_type_name == req.body.bussiness_type_name) {
                    type.bussiness_type_name = franchiseeTypeEdit.bussiness_type_name;
                    type.description = franchiseeTypeEdit.description;
                    type.save(function (err, type) {
                        res.send({
                            state: "success",
                            message: "Business Type updated"
                        }, 200);
                    })

                }
                else {
                    FranchiseeType.find({ bussiness_type_name: { $regex: new RegExp(req.body.bussiness_type_name, 'i') }, version_id: req.body.version_id }, function (err, type_name) {
                        if (err) {
                            return res.send({
                                state: "err",
                                message: "Something went wrong. We are looking into it."
                            }, 500);
                        }
                        if (type_name == null || type_name.length != 0) {
                            res.send({
                                state: "failure",
                                message: "Name already exists"
                            }, 201);
                        }
                        else {
                            type.bussiness_type_name = franchiseeTypeEdit.bussiness_type_name;
                            type.description = franchiseeTypeEdit.description;
                            type.save(function (err, type_name) {
                                res.send({
                                    state: "success",
                                    message: "Business Type updated"
                                }, 200);
                            })
                        }
                    })

                }

            }

        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});


router.post('/create_business_type', utils.authenticated, function (req, res) {
    try {
        FranchiseeTypeList.findOne({ 'doc_name': { $regex: new RegExp(req.body.doc_name, 'i') }, businessType_id: req.body.businessType_id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (type) {
                return res.send({
                    state: "failure",
                    message: "Franchisee type with this name exist."
                }, 201);
            }
            else {
                var document_list_types = new FranchiseeTypeList();
                document_list_types.businessType_id = req.body.businessType_id;
                document_list_types.version_id = req.body.version_id;
                document_list_types.franchisor_id = req.body.franchisor_id;
                document_list_types.doc_name = req.body.doc_name;
                document_list_types.doc_link = "";
                document_list_types.save(function (err, document_list_types) {
                    if (err) {
                        return res.send({
                            state: "err",
                            message: "Something went wrong.We are looking into it."
                        }, 500);
                    }
                    else {
                        return res.send({
                            state: "success",
                            message: "Successfully added in the array.",
                            document_list_types: document_list_types
                        }, 200);
                    }
                })
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});

router.put('/update_business_type', function (req, res) {
    var franchiseeTypeListEdit = req.body;
    console.log(req.body);
    try {
        FranchiseeTypeList.findById({ _id: franchiseeTypeListEdit._id }, function (err, type) {
            console.log('franchiseeTypeListEdit', franchiseeTypeListEdit);
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (type) {
                type.doc_name = franchiseeTypeListEdit.doc_name;
                type.businessType_id = franchiseeTypeListEdit.businessType_id;
                type.doc_link = "";
                type.save(function (err, type) {
                    if (err) {
                        res.send({
                            state: "err",
                            message: "Something went wrong."
                        }, 500);
                    }
                    else {
                        res.send({
                            state: "success",
                            message: "Business type Updated."
                        }, 200);
                    }
                });
            }
            if (!type) {
                res.send({
                    state: "failure",
                    message: "Failed to edit."
                }, 400);
            }
        })
    }
    catch (err) {
        return res.send({
            state: "error",
            message: err
        });
    }
});

router.delete('/delete/business_type/:id', function (req, res) {
    try {
        FranchiseeTypeList.findByIdAndRemove({ _id: req.params.id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (!type) {
                return res.send({
                    state: "err",
                    message: "Id is wrong."
                }, 500);
            }
            else {
                return res.send({
                    state: "success",
                    message: "Removed successfully"
                }, 200);
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
router.get('/get_kyc_files/:businessType_id/:franchisor_id', function (req, res) {
    try {
        FranchiseeTypeList.find({ businessType_id: req.params.businessType_id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            else {
                return res.send({
                    state: "success",
                    data: type

                }, 200);
            }
        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
router.delete('/delete/franchiseeType/:id', function (req, res) {
    try {
        FranchiseeType.findByIdAndRemove({ _id: req.params.id }, function (err, type) {
            if (err) {
                return res.send({
                    state: "err",
                    message: "Something went wrong.We are looking into it."
                }, 500);
            }
            if (!type) {
                return res.send({
                    state: "err",
                    message: "Id is wrong."
                }, 500);
            }
            else {
                return res.send({
                    state: "success",
                    message: "Removed successfully"
                }, 200);
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});


function upload_folder_file(req, res, obj, status, folder_Id, franchisee_Id) {
    var library = new Library();
    library.path = obj.location;
    library.key = obj.key;
    library.file_name = obj.originalname;
    if (obj.mimetype == "application/pdf") {
        library.image_type = "pdf";
    }
    if (obj.mimetype == "image/png" || obj.mimetype == "image/jpg" || obj.mimetype == "image/jpeg" || obj.mimetype == "image/gif") {
        library.image_type = "image";
    }
    library.uploaded_status = status;
    library.date_uploaded = Date.now();
    library.folder_Id = folder_Id;
    library.franchisee_Id = franchisee_Id;
    library.save(function (err, library) {
        if (err) {
            res.send({
                status: 500,
                state: "err",
                message: "Something went wrong."
            }, 500);
        }
        else {
        }
    });
}

function notify_user(req, res, message, reason, kyc_data) {
    console.log('kycdata', kyc_data);
    var fromName = "CARZ";
    var mailOptions = {
        to: 'vishnu@wtastudios.com',
        subject: 'notify',
        from: "ikshitnodemailer@gmail.com",
        headers: {
            "X-Laziness-level": 1000,
            "charset": 'UTF-8'
        },

        html: 'File rejected.'
    }
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        secure: false, // use SSL
        port: 25, // port for secure SMTP
        auth: {
            user: 'ikshitnodemailer@gmail.com',
            pass: 'ikshit1007007'
        }
    });
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            return res.send(error);
        }
        else {
            return res.send({
                state: "success",
                message: message,
                data: kyc_data
            }, 200);
        }
    });
}

function update_kyc(req, res, kyc, message, reason) {
    let franchisee_name;
    let partner_name;
    let franchisee_email;
    let partner_email;
    KycUploads.findById({ _id: kyc._id }, function (err, update_kyc) {
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        else {
            console.log('kycss', update_kyc);
            update_kyc.docs_types = kyc.docs_types;
            update_kyc.save(function (err, kyc) {
                // if(message === "Doc rejected!"){
                //     notify_user(req,res,message,reason, kyc);
                // }
                // else{
                Franchisee.findById( { _id: update_kyc.franchisee_id }, (err, franchisee) => {
                    if (err) {
                        console.log(err);
                    }
                    if (franchisee) {
                        franchisee_name = franchisee.franchisee_name;
                        franchisee_email = franchisee.franchisee_email;

                    }
                })
                Partner.findById( { _id: update_kyc.partner_id }, (err, partner) => {
                    if (err) {
                        console.log(err);
                    }
                    if (partner) {
                        partner_name = partner.partner_name;
                        partner_email = partner.partner_email;
                        res.send({
                            state: "success",
                            message: message,
                            data: kyc, franchisee_name, partner_name, partner_email, franchisee_email
                        }, 200);
                    }
                })
                // }
            });
        }
    });
}
function update_business_type(req, res, getData, doc) {
    console.log(doc, "518")
    KycUploads.findOne({ franchisee_id: doc.franchisee_id, partner_id: doc.partner_id }, function (err, kyc) {
        console.log(kyc, "519")
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        if (!kyc) {
            return res.send({
                state: "failure",
                message: err
            }, 400);
        }
        else {
            var search = getData.doc_name;
            var results = _.findIndex(kyc.docs_types, function (chr) {
                return chr.doc_name == search;
            });

            kyc.docs_types[results].doc_link = doc.link;
            kyc.docs_types[results].doc_status = 'Uploaded';
            update_kyc(req, res, kyc, "Uploaded successfully");
        }
    });
}
router.put('/upload_doc', upload.single('doc_file'), function (req, res) {
    var getData = JSON.parse(req.body.document);
    console.log(getData.uploaded_by,'706');
    activity_data.franchisor_id = getData.franchisor_id;
    activity_data.franchisee_id = getData.franchisee_id;
    try {
        var doc = new Doc();
        doc.doc_name = getData.doc_name;
        doc.link = req.file.location;
        doc.key = req.file.key;
        doc.franchisee_id = getData.franchisee_id;
        doc.partner_id = getData.partner_id;
        doc.uploaded_by = getData.uploaded_by;
        if (req.file.mimetype == "application/pdf") {
            doc.file_type = "pdf";
        }
        if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/gif") {
            doc.file_type = "image";
        }
        doc.stage_name = getData.stage_name;
        doc.date_uploaded = new Date();
        activity_data.name = 'Kyc file ' +  getData.doc_name + ' has uploaded.';
        activity_data.activity_of = 'franchisee';
        var saveActivity = saveActivityTracker(activity_data);
        doc.save(function (err, doc) {
            console.log(doc, "561");
            upload_folder_file(req, res, req.file, getData.status, getData.folder_Id, getData.franchisee_id)
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            else {
                update_business_type(req, res, getData, doc);
            }
        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
function find_and_delete_file(req, res, lib_file) {
    // remove
    Library.remove({ path: lib_file }, function (err, lib) {
        if (err) {
            return res.send({
                state: "error",
                message: err
            }, 500);
        }
        else {
        }
    })
}
router.put('/delete_doc', function (req, res) {
    try {
        KycUploads.findOne({ _id: req.body.kyc_id }, function (err, kyc) {
            if (err) {
                res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            else {
                var search = req.body.doc_name;
                var results = _.findIndex(kyc.docs_types, function (chr) {
                    return chr.doc_name == search;
                });
                find_and_delete_file(req, res, kyc.docs_types[results].doc_link);
                kyc.docs_types[results].doc_link = "";
                kyc.docs_types[results].doc_status = 'Pending';
                update_kyc(req, res, kyc, "Doc deleted successfully!");
            }
        });
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
router.put('/reject_doc', function (req, res) {
    try {
        KycUploads.findOne({ _id: req.body.kyc_id }, function (err, kyc) {
            if (err) {
                res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            else {
                var reason = new Reasons()
                reason.reason_listed = req.body.reason_listed;
                reason.reason_in_text = req.body.reason_in_text;
                reason.status = req.body.status;
                reason.doc_name = req.body.doc_name;
                reason.franchisee_Id = req.body.franchisee_Id;
                reason.partner_Id = req.body.partner_Id;
                reason.franchisee_email = req.body.franchisee_email;
                reason.franchisee_name = req.body.franchisee_name;
                reason.partner_name = req.body.partner_name;
                reason.partner_email = req.body.partner_email;
                reason.kyc_id = req.body.kyc_id;
                reason.save(function (err, reason) {
                    if (err) {
                        res.send({
                            state: "error",
                            message: err
                        }, 500);
                    }
                    else {
                        var search = req.body.doc_name;
                        var results = _.findIndex(kyc.docs_types, function (chr) {
                            return chr.doc_name == search;
                        });
                        kyc.docs_types[results].doc_link = "";
                        kyc.docs_types[results].doc_status = 'Rejected';
                        kyc.docs_types[results].reason_in_text = req.body.reason_in_text;


                        let user_data = {};
                        user_data.user_mail = req.body.franchisee_email;
                        user_data.user_mail = req.body.partner_email;
                        user_data.subject = 'Kyc file rejected';
                        // user_data.html = req.body.reason_listed + req.body.reason_in_text +'.' + ' Please reupload.<p>Best,</p><p>Carz.</p>'
                        user_data.html = "<p>Hi, " + req.body.franchisee_name + "<br>" + "Your Kyc file has been rejected" + "<br> " + " <b>Reason:</b>" + req.body.reason_listed + " <br>" + "<b>Comment:</b>" + req.body.reason_in_text + "<br><br>" + "Best," + "<br>" + "Carz.</p>"

                        console.log(user_data,'user_data');
                        utils.send_mail(user_data)
                        // res.send({
                        //     state:"success",
                        //     message:'Success',
                        //     data:kyc
                        // },200);
                        update_kyc(req, res, kyc, "Doc rejected!", reason);
                    }
                });
            }
        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});
var activity_data = {
    name: '',
    source: '',
    activity_of: '',
    franchisee_id: '',
    franchisor_id: ''
}
router.put('/approve_doc', function (req, res) {
    var kycForm = req.body;
    console.log("kycForm", kycForm);
    try {
        KycUploads.findById({ _id: kycForm.kyc_id }, function (err, kyc) {
            console.log('kyc11', kyc);
            if (err) {
                return res.send({
                    state: "error",
                    message: err
                }, 500);
            }
            if (!kyc) {
                return res.send({
                    state: "failure",
                    message: "Not found"
                }, 200);
            }
            else {
                var reason = new Reasons()
                reason.status = req.body.status;
                reason.doc_name = req.body.doc_name;
                reason.franchisee_Id = req.body.franchisee_Id;
                reason.partner_Id = req.body.partner_Id;
                reason.kyc_id = kyc._id;
                reason.save(function (err, reason) {
                    if (err) {
                        res.send({
                            state: "error",
                            message: err
                        }, 500);
                    }
                    else {
                        var search = req.body.doc_name;
                        var results = _.findIndex(kyc.docs_types, function (chr) {
                            return chr.doc_name == search;
                        });
                        kyc.docs_types[results].doc_status = 'Approved';
                        update_kyc(req, res, kyc, "Doc approved!");
                    }
                });
            }
        })
    }
    catch (err) {
        res.send({
            state: "error",
            message: err
        }, 500);
    }
});



module.exports = router;
