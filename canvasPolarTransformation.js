

(function(window,undefined){
	var
		document = window['document'],
		xywh2polar = function(x,y,w,h){
			return {'r':y/2.0,'t':((x - (w/2.0)) / (w/2.0)) * 180};
		},
		polar2xy = function(r,t){
			return {'x':r * Math.cos(t), 'y': r * Math.sin(t)};
		},
		xy2polar = function(x,y){
			var
				r = Math.sqrt(Math.pow(y,2) + Math.pow(x,2)),
				t = 0
			;
			if(x > 0){
				t = Math.atan(y / x);
			}else if(x < 0 && y >= 0){
				t = Math.atan(y/x) + Math.PI
			}else if(x < 0 && y < 0){
				t = Math.atan(y/x) - Math.PI;
			}else if(x == 0 && y > 0){
				t = Math.PI / 2;
			}else if(x == 0 && y < 0){
				t = 0 - (Math.PI / 2);
			}
			return {'r':r,'t':t};
		},
		xywh2polarxy = function(x,y,w,h){
			return {'x':x - (w/2.0), 'y': y - (h/2.0)};
		},
		polar2txy = function(r,t,width,height){
			
		},
		polarJS = function(canvas){
			if(canvas == undefined){
				throw 'Canvas element not defined';
			}else if(!canvas.getContext){
				throw 'canvas.getContext not supported';
			}
			var
				ctx = canvas.getContext('2d')
			;
			if(!ctx){
				throw new 'Could not get 2D context';
			}
			var
				width    = ctx.canvas.width,
				height   = ctx.canvas.height,
				scaled   = document.createElement('canvas'),
				sctx     = scaled.getContext('2d'),
				polar    = document.createElement('canvas'),
				pctx     = polar.getContext('2d')
			;

			scaled.width  = width;
			scaled.height = height;
			if(height > width){
				scaled.width = height;
			}else if(width > height){
				scaled.height = width;
			}
			sctx.scale(scaled.width / width, scaled.height / height);
			sctx.drawImage(canvas,0,0);

			polar.width = polar.height = scaled.width;
			var
				radius = polar.width / 2.0,
				pdata  = pctx.getImageData(0,0,polar.width,polar.height)
			;
			for(var y=0;y<polar.height;++y){
				for(var x=0;x<polar.width;++x){
					var
						i  = (x * 4) + (y * 4) * polar.width,
						xy = xywh2polarxy(x,y,polar.width,polar.height),
						rt = xy2polar(xy.x,xy.y)
					;
					if(rt.r > radius){
						continue;
					}
					var
						sourceX    = Math.floor(radius + ((rt.t * (180/Math.PI)) / 180)),
						sourceY    = Math.max(0,Math.floor(((rt.r / radius) * scaled.height)) - 1),
						sourceData = sctx.getImageData(sourceX,sourceY,1,1)
					;
					pdata.data[i + 0] = sourceData.data[0];
					pdata.data[i + 1] = sourceData.data[1];
					pdata.data[i + 2] = sourceData.data[2];
					pdata.data[i + 3] = sourceData.data[3];
				}
			}
			pctx.putImageData(pdata,0,0);

			return polar;
		}
	;

	window['canvasPolarTransform'] = polarJS;
})(window);