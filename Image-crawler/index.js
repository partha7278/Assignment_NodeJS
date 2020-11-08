const express = require('express');
const app = express();
const cheerio = require('cheerio');
const CrawlerJS = require("js-crawler");
const axios = require('axios');
app.use(express.json());


app.get('/', async (req,res)=>{

    var images = {};
    var baseurl = req.query.url;
    var murls = {};



    var crawler = new CrawlerJS().configure({ignoreRelative: false, depth: req.query.depth ? req.query.depth : 1});
    
    function urlc(){
        return new Promise((resolve,reject) =>{ 
        crawler.crawl({
            url: baseurl,
            success: function(page) {
                // console.log(page.url);
            },
            failure: function(page) {
                // console.log(page.status);
            },
            finished: async function(crawledUrls) {

                for(let x in crawledUrls){

                    if(!murls[crawledUrls[x]] && crawledUrls[x].indexOf(baseurl) == 0){
                        // turls.push(crawledUrls[x]);
                        console.log(crawledUrls[x]);
                        
                        try{
                            let respons = await axios.get(crawledUrls[x]);
                            const $ = cheerio.load(respons.data);
                            $('html').find('img').each(function(){
                    
                                if( images[$(this).attr('src')]) {
                                    images[$(this).attr('src')] =  images[$(this).attr('src')] + 1;
                                }else{
                                    images[$(this).attr('src')] = 1
                                }
                            });
        
                            $('html').find('[backgroung-image]').each(function(){
                                var bgurl = $(this).css('background-image');
        
                                if (bgurl != 'none') {
                                    bgurl = bgurl.replace('url("','').replace('")','');
                                    if( images[bgurl]) {
                                        images[bgurl] =  images[bgurl] + 1;
                                    }else{
                                        images[bgurl] = 1
                                    }
                                };
                            });
                        }catch(e){
                            // console.log(e);
                        }
                    }
                    murls[crawledUrls[x]] = crawledUrls[x];
                }
                // console.log(images);

                resolve(images);
            }
        });
    });}

    var m = await urlc();

    return res.json(m);
});



const server = app.listen(5000, () => console.log(`Listening on port 5000...`));


module.exports = server;