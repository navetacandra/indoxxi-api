async #get_embed(html) {
        try {
            let isSeries = html.includes('id="list-eps"');
            if(!isSeries) {
                let forceEmbed = html.split(`$('#vidframe').attr('src','`)[1].split(`');`)[0];
                try {
                    let _html = await this.#loadHtml(forceEmbed);
                    let _ = cheerio.load(_html);
                    let sources;
                    if (_html.includes(`datasources = atob('`)) {
                        sources = JSON.parse(Buffer.from(_html.split(`datasources = atob('`)[1].split(`');`)[0], 'base64').toString('binary'));
                    } else {
                        sources = JSON.parse(_html.split(`datasources = '`)[1].split(`';`)[0]);
                    }
                    if(sources.length) {
                        sources = sources.filter(v => v.meta !== undefined || null);
                        sources = sources.filter(v => !/drive|vidsrc|mp4s|blogspot|cvideo/i.test(v.meta.type));
                        let links = sources.map(v => {
                            return `${public_uri}/embed/?url=${v.sources[0].file}`
                        });
                        return links.sort((a, b) => {
                            if(a.includes('streamtape')) return -1
                            else 0
                        });
                    } else {
                        return 'links not found!';
                    }
                } catch(error) {
                    return {
                        'status': 'error',
                        'message': error.toString()
                    };
                };
            } else {
                try {
                    let $ = cheerio.load(html);
                    let backdrop = html.split("imgbkr ='")[1].split("';")[0];
                    let title = encodeURIComponent($('[itemprop="name"]').attr('content'));
                    let epsList = [];
                    $('.btn-eps').each(function() {
                        let data = $(this).attr('onclick').replace("loadVideo(", "").replace(")", "").replace(/'/g, "").split(',');
                        data.shift();
                        let svr = data[0],
                            eps = data[1],
                            nno = data[2],
                            slug = data[3],
                            tmdb = data[4];
                        let url = `http://104.248.67.9/dutaxxi.com/playertv/index.php?title=${title}&site=http://104.248.67.9/dutaxxi.com&backdrop=${backdrop}&slug=${slug}&svr=${svr}&nno=${nno}&epi=${eps}&tmdb=${tmdb}`;
                        epsList.push(url);
                    });
                    let _list = epsList.map(async (el, i) => {
                        try {
                            let _html = await this.#loadHtml(el);
                            let _ = cheerio.load(_html);
                            let sources;
                            if (_html.includes(`datasources = atob('`)) {
                                sources = JSON.parse(Buffer.from(_html.split(`datasources = atob('`)[1].split(`');`)[0], 'base64').toString('binary'));
                            } else {
                                sources = JSON.parse(_html.split(`datasources = '`)[1].split(`';`)[0]);
                            }
                            sources = sources.filter(v => v.meta !== undefined || null);
                            sources = sources.filter(v => !/drive|vidsrc|mp4s|blogspot|cvideo/i.test(v.meta.type));
                            let links = sources.map(v => {
                                return `${public_uri}/embed/?url=${v.sources[0].file}`
                            });
                            return links.sort((a, b) => {
                                if(a.includes('streamtape')) return -1
                                else 0
                            });
                        } catch(e) {
                            return {
                                'status': 'error',
                                'message': e.toString()
                            };
                        }
                    });
                    let list__ = await Promise.all(_list);
                    return list__.map((el, i) => {
                        return {
                            'eps': '' + (i+1),
                            'link': el.length > 0 ? el : 'links not found'
                        };
                    });
                } catch(error) {
                    return {
                        'status': 'error',
                        'message': error.toString()
                    };
                };
            };
        } catch(err) {
            return {
                'status': 'error',
                'message': err.toString()
            };
        };
    }