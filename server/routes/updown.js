var moment = require('moment');
var multer = require('multer');
var mime = require('mime-types');
var fs = require('fs');
var mysql = require('/root/wp/db/mysql.js');
var storage = multer.diskStorage({

    destination : function(req,file,cb){
        cb(null,'/root/wp/download');
    },
    filename : function(req,file,cb){


        cb(null,moment().format('YYYY-MM-DD_HH:mm:ss')+":"+file.originalname);
    }
    
    
});

var maxFileSize= 30*1000*1000;
var upload = multer({storage : storage,limits:{files:12, fileSize: maxFileSize}}).array('files',12);

/*
//upload file
function upload_file(req,res,next){
    upload(req,res,function(err){});
      
    
    //console.log(req); 
    res.send('<script type = "text/javascript">alert("파일이 업로드 되었습니다."); document.location.href = "/upload.html"</script>');

};

//download file
function download_file(req,res){

    var file = './download/test.txt';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition','attachment; filename = ' + filename);
    res.setHeader('Content-type',mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
};
*/
function write_article(req,res,next){
    
    var title;
    var contents;
    var file_path;
    var date;
    var author;
    var i = 1;
    var chapter;
    /*
    if(req.files[0] != undefined){

        file_path = req.files[0].path;
        while(1){
            if(req.files[i] == undefined) break;
            file_path = file_path + "|" + req.files[i].path;
            i++;
        }
    }
    else{
        file_path = "-1";
    }
    */
    file_path = '-1';
    title = NoScriptOrString(req.body.title);
    contents = NoScriptOrString(req.body.contents);
    hash = req.body.hashvalue;
    date = moment().format('YYYY-MM-DD HH:mm:ss');
    author = req.session.name;
    chapter = req.body.chapter;

    var table = req.body.table;
    if(table == 'C' || table == 'Java' || table == 'Python') var sql = 'INSERT INTO entries.Programing_' + table + ' (title,contents,path,date,author,chapter) VALUES (?,?,?,?,?,?)'; 
    else var sql = 'INSERT INTO entries.Web_' + table + ' (title,contents,path,date,author,chapter) VALUES (?,?,?,?,?,?)'; 
    if(title == "" || contents ==""){
    
        //res.send('<script type = "text/javascript">alert("빈칸 없이 작성해주세요."); document.location.href = "/"</script>');

    }
    else{
        mysql.query(sql
        ,[title,contents,file_path,date,author,chapter],
        function(error,result){
            if(error) console.log(error);
            else {

                if(file_path != "-1"){

                    upload(req,res,function(err,result){
                        if(err) console.log(err);
                    });
                }
                //res.send('<script type = "text/javascript">alert("글이 작성 되었습니다"); document.location.href = "/"</script>');
            }
        });
    }

};
function del_article(req,res,next){
   
    var number = req.body.article_num;
    var author = req.session.email;
    var path;
    var j = 0;

    var table = req.body.table;
    var sql = 'SELECT path FROM entries.Programing_' + table + ' where number = ?';
    mysql.query(sql,number,function(err,result){

        if(err) console.log(err);
        else{
       
                path=result[0].path.split('|');


                if(table == 'C' || table == 'Java' || table == 'Python') var sql2 = 'DELETE FROM entries.Programing_' + table + ' where number = ?'; 
                else var sql2 = 'DELETE FROM entries.Web_' + table + 'where number = ?';

                mysql.query(sql2,number,function(err,result){
                if(err) console.log(err);
                else{
                    //delete comment

                    if(table == 'C' || table == 'Java' || table == 'Python') var sql3 = 'DELETE FROM entries.Programing_' + table + '_comment where origin_num  = ?'; 
                    else var sql3 = 'DELETE FROM entries.Web_' + table + '_comment where origin_num = ?';
                    mysql.query(sql3,number,function(err,result){
                    if(err) console.log(err);
                    });
   
                    if(path[0] != '-1'){ 
      
                        for(var i in path){
                            //console.log(path[i]);
                    
                            fs.unlink(path[i],function(err){
                                if(err) console.log(err);
                                else console.log('file deleted');
                            });
                    }
                    }

                }
            });

        }
    }); 
}

function write_comment(req,res,next){
    
    var contents;
    var date;
    var author;
    var origin_num;
    
    contents = NoScriptOrString(req.body.comment);
    date = moment().format('YYYY-MM-DD HH:mm:ss');
    author = NoScriptOrString(req.session.name);
    origin_num = req.body.article_num;

    
    console.log("contents: "+ contents);
    console.log("date: "+ date);
    console.log("author: "+ author);
    console.log("origin_num:"+ origin_num);
   

    var table = req.body.table;
    if(table == 'C' || table == 'Java' || table == 'Python' ) var sql = 'INSERT INTO entries.Programing_' + table + '_comment (contents,date,author,origin_num) VALUES (?,?,?,?)';
    else var sql = 'INSERT INTO entries.Web_' + table + '_comment (contents,date,author,origin_num) VALUES (?,?,?,?)';
    if(author == undefined){
            //res.send('<script type = "text/javascript">alert("댓글을 작성하려면 로그인 해주세요."); document.location.href = "/"</script>');
    }
    else{
        if(contents == ""){
            //res.send('<script type = "text/javascript">alert("빈칸으로 제출 할 수 없습니다."); document.location.href = "/"</script>');
        } 
        else{
            mysql.query(sql
                    ,[contents,date,author,origin_num]
                    ,function(err,result){
                    if(err) console.log(err);
                    });

           res.redirect("/");
        }
    }
    
    
}

function del_comment(req,res){
    
    /*
    //var author = req.body.author;
    //var date = req.body.date;
    //var num = req.body.
    var table = req.body.table;
    if( table == 'C' || table == 'Java' || table == 'Python' ) var sql = 'DELETE FROM Programing_' + table + '_comment  where author = ? and date = ?';
    if(author == req.session.name){
        mysql.query('delete from entries.Programing_C_comment where author =? and  date = ?'
        ,[author,date]
        ,function(err,result){
            if(err) console.log(err);
        });
    }
    else{
        
        res.send('<script type = "text/javascript">alert("본인의 글만 삭제 할 수 있습니다.."); document.location.href = "/"</script>');
    }*/
    
}
function up(){
    return upload;
}

function save_score_tetris(req,res){
    
    var player = req.session.name;
    var score = req.body.score;

    mysql.query('INSERT INTO game_board.tetris (player,score) VALUES (?,?)'
        ,[player,score]
        ,function(err,result){
            if(err) console.log(err);
    });

}

function save_score_pacman(req,res){
    
    var player = req.session.name;
    var score = req.body.score;

    mysql.query('INSERT INTO game_board.pacman (player,score) VALUES (?,?)'
        ,[player,score]
        ,function(err,result){
            if(err) console.log(err);
    });

}
function NoScriptOrString(comments){
    comments = comments.replace(/</g,"&lt;");
    comments = comments.replace(/>/g,"&gt;");
    comments = comments.replace(/\"/g,"&quot;");
    comments = comments.replace(/\'/g,"&#39;");
    return comments;
}

function test(){
    console.log(process.env.host);
}
module.exports.test = test;
module.exports.write_article = write_article;
module.exports.up = up;
module.exports.del_article = del_article;
module.exports.write_comment = write_comment;
module.exports.del_comment = del_comment;
module.exports.save_score_tetris = save_score_tetris;
module.exports.save_score_pacman = save_score_pacman;
