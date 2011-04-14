(function(window,undefined){
	var
		document = window['document'],
		xywh2polar = function(x,y,w,h){
			return {'r':y/2.0,'t':((x - (w/2.0)) / (w/2.0)) * 180};
		},
		polarJS = function(canvas,resample){
			if(canvas == undefined){
				throw 'Canvas element not defined';
			}else if(!canvas.getContext){
				throw 'canvas.getContext not supported';
			}
			resample = resample || 1;
			var
				ctx = canvas.getContext('2d')
			;
			if(!ctx){
				throw new 'Could not get 2D context';
			}
			var
				width = ctx.canvas.width,
				height = ctx.canvas.height,
				rscanvas = document.createElement('canvas'),
				rsctx    = rscanvas.getContext('2d'),
				acanvas = document.createElement('canvas'),
				actx    = acanvas.getContext('2d')
			;
			rscanvas.width = width * resample;
			rscanvas.height = height * resample;
			rsctx.scale(resample,resample);
			rsctx.drawImage(canvas,0,0);
			width = rscanvas.width;
			height = rscanvas.height;

			acanvas.width  = width + (1 - (width % 2));
			acanvas.height = height + (1 - (width % 2));
			if(acanvas.width > acanvas.height){
				acanvas.height = acanvas.width;
			}else if(acanvas.width < acanvas.height){
				acanvas.width = acanvas.height;
			}

			actx.scale(acanvas.width / width,acanvas.height / height);
			actx.drawImage(rscanvas,0,0);

			var
				adata   = actx.getImageData(0,0,acanvas.width, acanvas.height),
				bcanvas = document.createElement('canvas'),
				bctx    = bcanvas.getContext('2d')
			;
			bcanvas.width = bcanvas.height = acanvas.width;
			var
				bdata   = bctx.createImageData(bcanvas.width, bcanvas.height),
				avgs    = {}
			;

			for(var y=0; y < adata.height; ++y){
				for(var x=0;x<adata.width;++x){
					var
						rt = xywh2polar(x,y,adata.width,adata.height),
						rtx = rt.r * Math.cos(rt.t),
						rty = rt.r * Math.sin(rt.t),
						bx = Math.floor((bcanvas.width / 2.0) + rtx),
						by = Math.floor((bcanvas.height / 2.0) + rty),
						ai = (x  * 4) + (y  * 4) * acanvas.width,
						bi = (bx * 4) + (by * 4) * bcanvas.width
					;
					if(avgs[bi] == undefined){
						avgs[bi] = [];
					}
					if(avgs[bi + 1] == undefined){
						avgs[bi + 1] = [];
					}
					if(avgs[bi + 2] == undefined){
						avgs[bi + 2] = [];
					}
					if(avgs[bi + 3] == undefined){
						avgs[bi + 3] = [];
					}
					avgs[bi + 0].push(adata.data[ai + 0]);
					avgs[bi + 1].push(adata.data[ai + 1]);
					avgs[bi + 2].push(adata.data[ai + 2]);
					avgs[bi + 3].push(adata.data[ai + 3]);
				}
			}
			for(var i in avgs){
				var sum = 0;
				for(var j=0;j<avgs[i].length;++j){
					sum += avgs[i][j];
				}
				bdata.data[i] = sum / avgs[i].length;
			}
			bctx.putImageData(bdata,0,0);

			var
				ccanvas = document.createElement('canvas'),
				cctx    = ccanvas.getContext('2d')
			;
			ccanvas.width = canvas.width;
			ccanvas.height = canvas.height;
			cctx.scale(ccanvas.width / bcanvas.width, ccanvas.height / bcanvas.height);
			cctx.drawImage(bcanvas,0,0);
			return ccanvas;
		}
	;

	window['canvasPolarTransform'] = polarJS;
})(window);