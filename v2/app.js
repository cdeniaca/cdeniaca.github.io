(() => {
  const portrait = document.getElementById("heroPortrait");
  if (portrait) portrait.src = "data:image/webp;base64," + "UklGRtY7AABXRUJQVlA4WAoAAAAQAAAAUwEAUgIAQUxQSAAXAAABEYdt20gS7GR/T/8FbybjewqI6P8EYCoBd7O69NpzXqlAnj1NwOnK2VIDf4ZlgWyod3pAE/YstILzIrCNJV2EJAvnDdIjEvomOejr9uQ42W6AHCaFI5iPQcHkWkQwtTZMILmZZAIM8sgiW+2hMGgkKczt+ncN9A9SARExATkCOKcql/3+gQdoeT8f+QKeedHz4LJzkkjG/LkNlRRrSQWtRKm+laTgSsZsiiqtFE2UYpKZ/KQbSZIcpWcPYZ1H8Aj+/zcNY/fsiUJFREzABPjatm1Ro2vb9uMsx0KAkJCOtcu43e/7V9xz9x/TOXfXqeHuLu3e8QABivLzPG7ra7k7QNVxe0RMgG3b2tNIkn6QZMkYYYiIDIeDI7kos5mZmbvvaJiZmeEp+QUYY6DAsEKpteYmIiZA5e8zfSQWIKUAVatZH6EIYwaMkRqybHLWmgpOf8v7CNMnhzmKy0ttCsPSolzP7vQ8r99xYLKY6T0cvj3TiJ4+i6OjYZwxiwkpu9HsbzUaTScfXRrkqWG8z+QFOBsOs8uHz168i8OoMBJCVq3b3dr0LH0Rpplm/Iey0ZxOLl68Hj9/fjaMDAuH8oPu3l4rC6eZYXxgLpI4Onz9+FuPh1Fm3IWyvN7OoO1OZhnjajLn6cWT7zx/9nzoKMh2m52NnTUezg2uMpvo8uLJ17/pk4ugxrVBf0NdzgrGledifvSDa3vyX1vHEHa6+3e64TDWWEzW4WP3Vz47Bn/vfmcUFYzFZRthnCSZZjkIdh+0xjkWm4h8F3mcFiwDKrh2nyLGwpPlBj6iy5gFgOz1vV09ZyxDsj0vOxlHOVc7K/BU6+7OJGIsR1IWZ8nZODUVjtz+7U3b1hc5Y4kqTKfjSV7VyGkODrZcnoQGS5XAdPp8rCoZ2a3tg0E61sxYukpND0frVgVDb+f+QJ2ljOWsc7PrUQW79uO9UcJY2krViblq/fOvdwdzxhInIlKV66+/6pLBcmcQK6pSKOH3NOMlB8Awc3VCc3DH4jTE0ieQqlCQPf72fVOz/MAgVlSV/mk2BwPGajTMXI0atzcuGCuSQAqVWK3d4gIrk0FMVIG8nn+JlWrYmMpjD25eZiuFQEViKo5q3Fif8UoB6+Hzqak01NjvHxmsWDN6Mi6qDNVv3RpnWLlFpJmpujh7D9KUVw8bjidcWaz2QRBjJZvThxWFlGrfal/wauLJ265bRay1Tq2/flRgRev0ZoMriHf3p9vhSYGVbTZ8Q9XD3b0RJBqrmxsbTcWVgxyXsNLdXptM1UCLtFltyl9r2RUDdd855dUGq73tm2rh792axVjxGB4/uNYXCefax+yIVx3w8OEHCrpA+Le35ozV7y3u2dcXB9Xo5AYlEIOT24biwmD3O0MuAyDGD97Rw4uCt+EkKIfh1SdW3gVBrW+OdUng9OrZwEi8CAS7azOURTl78LEHNuYCYPf2Ql0aML7/4596pIfWZ7Vv2DOURzm8dK3SYPvUun/tRJcIYKUEWp+zfXteoGRuwfapeWCnKJuC0fLswWDIZUMWhbQ8f9dPUTbNem3szmq1Y106xGCekM1R65Y35tJBisOMLc7ZvjnRKJ92oGNtb9Q8sFOUUHKy08je7MHggksJJScza6PmdStFKVVOkbCt2RvXzrmckOvkvq2p9VaEkmoHasSWRo7Kygq51lRaml9PSgsonwZoZWptMDblxTorhZVR0Iq4vLhXT0MrAylGeVXVOkQbs1yTlRjyU9/GVGdrmpQY6GnlWZh7fe/clBmzXBgLc3qNHGWWs03O9qUc6FKDvaOJtC5VC8JyA145C9C27F53xOWGR6c52ZZq+jHKLYWj0LqCVpqVHBBpoSyLWtuXpuyo2WGEdoV+I+ayQ71cgWU5VKDsInsS7crr6aj0gFeOpFWhv1Xo8mOWc8+qQNdyLj8i6SurEqk3RPnFaJYJm1JDPylDycGIbYqMKkoQyMSQRZESqS5DqEJhUaYMjk0Z4nzTJ2tS7QeUogxTtozRmlDvpVyKUGphUUoxSjIzWDSVJU6H2qJKs5odhOicKO5LcM+sFdoSAVySUFdjaUt2w8xLEpjl1LOl2jWdlSUOfLIkctrGlCVEsGaymMvS/6EySRQ5lHNpYi3QjpyeN4ItY7Qs2JL6Xlqe4s3AksizitIEMvDQjv4f6SqQ6Jy4uFJJ9zR+5PYIXRP6s6kG9yy1cE+o8j47JwiOTyN0Tt7ijolwTpidnUbomkAtruXknCiaD6VzAr0+SRAnUd0xlzhhdDBTOIFI+irghMnBdA8nyu5/4KihCfT6gZNRoAn6zUnC4oQ015lhaQLMyWEkTpx87VNnLE3IHn+v8JU0cWLd3GAjTIDfTY5jlibio+dTI03gJC5A0gRmQJUVXXBZA2BguJQUw5OkxEGhnOZvHodscQAzlxAzu8xh9cnosigfzIbL3fzJo7B8kA7nxurSl984NtbB8bG9VerM+NFhUTqQXqheqUMRxxmVDqPJKndA+EZz2aiAHL0OlDjBzDdtFicUa4FL4sStvd2ApAnu5kGgxYncVt21SJigajsHLXGC3d1va1MeiGCqADkNL8lLA/lrWVgFQE6QJ6YkuGs7m++KSgArcDJdDrzB/c2zGNWQnJrnqjLgDT62cZFxRYBqHVxvqtXnDx4EM0ZlxOjs9acqueu8wb3a1KBCUnz1pTtj3G3e4EEwM6iUFB8eBLDTve0H/pRRMckzvNPs7fv1qYEwBze2Lw2qJyqJu4yLJHEaduXwyrHaZcmTH2V3HjSpapjVyuAOK84fjQ7uNlA1udjsyR2GIi48X1UOSu+7N6MdBquhQq4cYA5uH+wy1b6lQ1RPCudTs8O8vYNzU0FArs5HYmdR64BzVFEe3H3XXuh7uJPU2saMKwn4V9949alHL8W4i7wte45qStm9H/rS554fix1EtYEuKgrAen3t6cdfx4ZXjdVpjbmyAIovDsM4yTWvFmerMUelNeS7nCWZ5lViN1RebUC257k6TTLDK0PV16a64oAsO/A9jqYJiFaD1dkYctUBQLYXmPO42WyplQA/iFGFiWxO1n789o/VbFoBlmvySgQQnP7d/R/f2faWH9U3oqoEKMdz13bvthQtvcZmyJUJAFm1tmPASw62a1CtSREUlj5xxQLABNCSq+IMY8DSBCIis8xUHVEFAzibJry8gi0klcyMf/g2X15uj3Uls+puUiwtUjZzJSPHL1KzfCzP/jcBX1YzqMBKsmVDzsaNjgUoOpqjmpPjxFO9XKzGteu7AQH6YmYqGohH58VSsdbu3zaj3ABsGJVN2RZ4mdTv3UkTg6rv9PrWMqHWTadA9Vd+y7eXiN/zR5BA1Rw09dKwN+9MMhEgd81L7GVRv96bsQiAHDrzloS1fjDTEEIef8ddEnanNWMpSJ9/2l4S9UGeQQiL1//wl7QcqNZPjRTMP/vrf8/Lwo1ZCsLP/81jLEe93BhwhWxYTQMGx0tyBstT7J2m4AwJ4EnYhkcnwh1YdQqnYXj7+F/uILjGR5Pwr/I03qIzcNYxngQ6nSG4Q1IwkxCfp1uHYArYE7DdFicCHGJ2jsYk5CW4xOQE9gRgvK+3LkEnUP1t1exoC675nzifugXiZfD3v2cFOEUGLR75g0nsFExa+NQb907vmGunUJxFHXRud+9tnWqwMI68xVK1zeudMw1hzI2zUKpx+551piGNxFho//Z9NTeQYGTCG9Su13MIJNMC6FHG1yOOzlggjFHqymH//MRcj8OnCeTRhNOWffVMORTXQ5azRIzOunTlgJjxBjLJWexDnhkyTSxRAq0z5YgTz89q8oTwrEbyZFIFgWZINC0EiwcvhKVkg7XhBXC6XUc0iuEwXwBvZ9sVjfj5s3gB9GSmRUOPR8UCJIeHqWiwMVhATlMWjf8yzUVm5Emfv56zOBXHT6fyZOJpgf8STSxRhbYsccrOp1vixLNH8wZJE+ZHpCDOJlf4/0szSJ50wr48pUdck6dsyJY8ccFKngDiBWGSDAYtiMVGLExSBGoxnCamYlGczbq0EGptL87FQl9GPhaR6tdbFywW0MZaCKv/IMwhzU5vfQ5pptZgnouTO+hfsGQwLUSwb2cQzDy3nUWwmzCCYSYXHWsByLYKlozpsI0FtDv+UDJQ5PYCUH3fSiDNVm93aMTJ6dbnkMwitbyrR63tKBeN+anvXj13e2PIksHRWUBXjtZu6ByiaXLClXe2Ns9ZNNhAXT13y0shmsWlaV851d6YaNlIjox35fxr7SnLhg6NumrUOsgKCKchumrw1zOWjkVUBIkmlqj/Ro7tswOOpIP8kFumOnvzWDq8xSZomX9j78KIx+r2UrSKOwdpAenE/qWZbJXe6UxZPEAmIbWJsoO5hnwiIbbJq9pTyOi2VSO7EBES3CbyYCQEoyqm9iACs4RQdjIS7RGRnBoJQVNNdGsoOYQZRFTNzobcmmz5ByMjVJzvm7bAq6cCqZ4vvNYQxJS05tZIKjI5KC+P2TlhfDRTzgm8cuqjc+LBScHOiZL1SDonUNV+hM5JDJdhOwhgTlAZhlba9SLipLW0vj0rcPJ2umOQitgG1d7Pc0nhOOEW2FtbI0iqWR9G2Jxa366JilreMRHNcRLmooLJUdmC4ujhhCUFZORjc3p8GMoKqkhjY8iGFymTQvm1lWku+dHnXmSoFA/e3UNb/vTvP376BAqovco0x9GTb5y9kILsCfBzMs0SKSCLQvoABqtmvTYVpJV7qapAwoJ+mQ58btMNrMSHky2b1bnba1ABlfU2bFTfasJCyWTUuEx4OH1hhfPjA9/kvAsL4TxsDFnuJFbA09I0BiaBVdFBjI0JrO5JaNp2clooMZoaUu3ucAALTFV5Dfk7a9OGFjWfNkTN/UIHWmAMNQOvlbPQysjYECkIrJfH1IzIUu/yxjgn+AfnGTVBFuUCQ8V+2ojTpYnAoPQFNuFtq0xgGrcCMvIEIvy3ffJqtjzZm7daJE5WZ6cmT2Z6nrDIIDWRnzyeigyFiWyA42kOiZWTgxjrA4NFhgfrjBuQWgyOrxXcAMsMmMuv3N3D2kwcFiJD+Z0Pjri29Pl3LgwxwL1VabCu7OHHn2TIgNo8sJB1menrC82MqB441nUBwbW+zIBX5LI+1PqFzGAw7nFt4en6hGUmOSpFbcmoJjTgpQHVxro1FxpUhmsDm3eJzFB/kVBtRfxSaDjf79cHKzIyg14ooXbyGVJL1ASkluJUuSc1O4ywLlVTUsP9gQd1e4OOLTTInsCa7MEv/mRNaMArpz7WQq2f+PlbrtQEZ49OuJbg1s/16iQ1cnI2FnWo3l07hdiGj/3g6bAOb7c7gdyqO3760QndGvnbqhAcsfnat47FrXn9xjkLDqbvfOtc3ZLq3DcRJDd87juPhbe2tjtn0dHnr1/zbwmOm0NyKdpfRnRrIJacLaXHAwGOGcnrKayBQYKzhe2WoEbOYs8nuUGEWs3l0XrfkRlEBIR6+fKl3uvaIsO+/BfUnb1+3LzbkxiKN0PGunjy6G3/XiEwnKxSgtrN6Omb3pNZrllWtkCGoUlC8is/O2h06oosm2SEJYTQiJfjP7zR23iwbTube00lIRynIEnc5tUX7GCrpbyf/NWfCQTERK9fpKKOQQ8V27e/+msDJR2cD9+9lVABAOcA3nz9zc+6wsH50Q+Ou6nKvxsdDjVkk7PjH407dpLKJsuMbHB+/GjeItTm8GTOJBn58Q+jFuGK6/MfnmtbMMzwe5ctwlXnaJgwBDN9+66jcPXZMAkGT19ZNsQ5GbtYSF0YyWBDC6HHJ0lLMMCLkb15NGMSDMW8CCYcZxBMt5HPzQJAJ5kRCyw//ssHNXQxffsuEwuInv7xM0En4levU7lQt321IyaKjFyIy596zO8E2DDLxfypE9WNdBiKBSXlJMJOmMnDd7lUqNkmJuhmfDoxQrHlLPOgo6wNRBIJSRJ2RSyFpi24ZkyXPXZNyIP9hBwTKq19Bscs9uYRgWuWk3mIjgkBtcfQcSZpSH70eYKuayaLBTP8xiPsmplN1hss5K++EULX9eii32ahOH0cdY7T1PdYMNN3k86BQWCRaHaEnZNHVdevuHOWVRgWyMWJ7prVal1qFuA0JlnX/J3WFDAqe1Rit1TnICqkAZSciG4Fe2tTSCO5/pN+p1RnL9HiAItejTvl73YmkMiPltQhq3MwLwRCBT85Ux3yd9anEEhyfvFU1B3VuT7XEgFdnfSpM/5+awqR5HSVc1dUdzfRMgGzWpqu+LudCYRSldOuqPWDuJAKNKlP3bC7G5csFuGqlN0I+pxCLP35qBtWf3to5ILC1MMuBLv1CILR38+5C25facno7Y9EF7iATXIBarKJsAPJCbZ8wRCjTdKF7Jw3PMFAkwbUAc7JJsEANam8DoinN1uH6JwoXRXcPrtmYtHA6HCqWmf3dqeyAbLfE21T6z/eGRnZoKSKqWXe7sHQQDiyk5FoFzX3kUM40VSlbhfqGzFLB8jqJMFWWTU7gnhSMgraVd/mWD5Q5alsk93fGRn5AL3amDbV9msRBFRkA69N/d2RkRA0g4Rbw/Z+EENE4qOZag0au2MjIuCVUx9bwujXI8goD45zbonR/UILCcWzPrWEvb0zFhIQSV+2xO3XzgST8iDGVqjmxvwBE86qsCXt/jBhgipNuBVwg0Q41cuVaQURGBRVLiJsg1fPIlCodzCWzZG/s3lUgALBcsSNkb9/r4iYFDYeNebuPsCcQSrqvsaGqPOgFTFElYrLY9GQu7M5YghL79qlqCFv28kgrWp6EKPHrbERF/JTnyx2p3HO4gLepFQO1dy1I8irXsy1I7i+fWQEBoVEAw7f+mBfuheennoNx+RD7++he8nevBhYjvLdDyr3wpMXuQdn+uS7t0eEjkWPDrv0QeTsiaePcy0QXQonUQ0fVo0unx9OS4OgjEB0I2B8cPbzwXITIRfrvp8oZnQgAPEHAmDhRwI4X6fjo6xXGCEJncfVRACUWvYnSXmSF1WoDRvDYmFycq7E9ZEkh3m4d5iNV8mz1xMtFfOzmnuF/heZdKwHq+jX/+gHqVBweFajK/a/iFLTn/zT00woTJIEWNTxJINQZqfcWBiGWCansBdGLjmLHCVOxXC+QeKUncYBpNmEZw1bnLLDYYekiWevLAeLq3yPJALR0KUFCvZ3XJHg3MIC+we7IsEaC2X5vpKI/AKtRQJBIs38hJyFYmZpYM4n52aTFgj17HSciUIRz9PzN6P9AIscfecvPz00YmDyZPjqeK6dnkMLFX/vrz87ZCEwyfjk4iSyvLZLWGwTnl8WIsBGT188O+eNmkVYfGatUf25mIzi83eq7VlYjnp8nlYn/kh4PQbrNJ8+epHUt2wszez145ArjTHv4zTM+T3kNxwCdBQZMzucpLoe+ArL00yGGaqsngyT9+jJYWjeYw3uthUQn52mMAW1mgrLlQ1XmvTJN4fm31OOb/N7VHe/QUDuekq1fEtBVvPj53N+T2DR+8hyFQD2FJY1VRqYPMcqZq40dsuaZCtIz8PMVBhvr/FmbFYORw+/9L3jrLrYG9ujd/nKQfzt3/ntL8y4sqDeT89XkB5+61PfHpnqYtmm4NUDkwwfv8mrCwiMlRy/OcoqzMrmLGN5gikMVxcGrSaOjiemsmhN9moy4x8d68oSnfreakI6ikxVKc6POmpFsTGoqumbsIZVlc7yqlJMtLWq9NmTS1NRoLG6Ri+nXFVWeZ4UAmUmo1ye0leP51xNGLS69Og0RiXlNPPVykJyPtGVpBhO+rSyeP7kZVZJ9GUYYHVnZxd5JYHW9goz87PQVJLVzqMfHhfyFJ/OWJxgsswI1OXbkMWpOHk4lieOJ5mUAFZQOCCwJAAAsCMBnQEqVAFTAj6pTqBLpiQ/qigTmvPwFQlnbs6bPZTjORQNeOdP0B+AH6zfwDM2zmdV+uNm2UlTQfg5+ivoFscV" + "h9cavDom8AWXDWay6ATPSoWxDnF/1EG5FfepsILvVGJ31Ex4SJjv0bU3TIQfyf6muU+uux0o9ESVoLf2ScV/kPq3hDmCztBnRDK3y+Xy+XpUqxDf97JYcfARQNRAKwBlKNkHXn6k9q8WPqvdy77/mDwJOL/RE1CIfBtZxOJxOJxN6tsbF2gQM6s3+jvIGb8Od0FdM9T1LCSjF7RcvJdc6xyN0wmSaciAZJHodhgdRVmOd0NoeM3m83m82+1ogGq0QBp6xe+oRFKvNn4YwEhSFVRgCtTfnXACkdjE2y9Vq6MMZmJQIAFLRnFMplMoi3R+BnXRwSgKOkv88mufdcPxxbf5OHDkdciWssUBUyMezA3R3tyUxXF9vdMaX7v8vGbiXWazWaoSHtVgVihn7+jt9pWWq98VWAMLKztDibueRwvSHw4o3dMGIjcN0xGXo5YIFe/nLRpq8xWy0me+wOf3icTicSiogfrDuOYL6X6i9tjky3j1gtdOQWHclmSzzfUqQ8G4fPkkWoGGhXrhAuxfv8hl9uZ1U6Fb5fL5QnMx42ou9cC1vSr778ljyfGgrxUyyWo81qaNLaZV/MVtcKFxiz/UU6gCYx9PbX1bh1zKfh9uqQTq0wqIG2KztKEzqdTqNVAPy7fMTDQ85rvijuPFti4+9HhSPU9vEd8iNo9S330Ti7Weggn8ksPVB/nfQK7nQIAiN0q+biCL7TvKgCcTiPpgKnqyV1y9xSbBCaOFUYgCx9SD4OTlY+EpQIVUxFU12w4KxnePgw/E9fqF5AIVsKrc9IiZi4XKbC+awR/KqIGAWMr2XGIl1ms1G3Y3U6feLK97/vgkW9n6R0BshHJynWBmUrpB5WTH1x1N0T2llXcMtmddHmChEPPkG3B20EV1zkmP95iny+NLAwH3Tfz3zQPWxjCwymUUoy9NN8k6Uy5aVv4ob5/QBw6n74GGjlBdJa2+pao/zToFOdHJsvaT1KRyLyd+bqZ3GWppot2Z6L2ZzWx1T+7DFx+nAOV8UxFhjdgS8H2sqdIni/loLh2om7Zf14l8v1OJWc1iT7LP4ZMvwrkhU7FTGznM9Y2WHR4vAvP07CqOt9J0y/aT8cZDF1DlWKW/rpncnoUy+E1F8lsXVCf8oUej5CTUxTwt14EGdxrYQFBQwvHfK2bHZkDfjiQxxFpnoM3OUv3fx1VYVOXhT2ifr6uQkHgHv4VPiGqvon80VeWP3zp6x5PqltdPLMoLgLhVt11RSRpxnZxcODFWaADwiiWqkJvyiSBHjhWPmjb2xDg+0xq7Jw34osD5FhrPJ3DNAv/f2ymBKEwtm0bhB14x+zpxexJT2VoA+X8mPh33m1mwIE1gvtuLVf92k0vj4JCcAgw7gMqeROc+PtX0LSfIhfRzTDn+pARRHN/raV7JM7u/s0MN7/FFafZSWqfAjFNcX7L7QV+jGwYNIr1xxPQxJrkS3XmqntVWhIoD8Q3u6pqCi5qq2/b+lHcnqq9fo22t8E1kYzuo5dtC5GdDjdaXsSHKhIYbD3h4NDvoEKJo3iA+k7EkDiAykkzsDwfxV0ERo7Tr+EgHXFZHedTyxfgrVqh+QO4EBP7ZzCMiHLkiFNSGvSqTEnpUQ9UO4vYly8ss4C0i9HcdpO5lJpOEy7uc3WSHn1mXQYna3ullrW9faDTQjE86gRsugeVL6PD1+91arlpnatZygIZaTbDW3xZJJcjT8tnLabuFLdGGRLipxxiFDHA2m1AQ41+xzxN6IBMwoQXoYiA8y8BuBZ8qpK/mPvvPJxQWcTGaqk1mIdZX5DUQD8KnzIntK2nUzjJ3i/Rj1iv+th6YtXUXupqRConlyUaE/Tl514EoHBXT5Ua9v/RH4rVIOp7Zzce3iMWT1IaY+C4nKbu3cGI1doW2IvVsFRBu3RxA4HWJdbo0dM22WYd5pa7EjDHtr9agDCFiW8jK/nd2V7qHgjMQZUpoZ68B64Uht5gR5e9B6NlGgEHRQlItk/f5OBsXnhkf3AtnRi7o/+1yEppS2PN8d4zx0M6MRERd9DLy4pWHN7a6cnQln8lHGtz4db12HlOZ/pWEEycQkoZ9WHTkr1OVS7MvZBx1WCNtHM/HspQ1UqjaRI91+y1szIUuRpjWXlRdiWQ1cCkK5Z5VQr7jB0W9CfJJXfJRUiE/jPi2kCCrYFfQVYeR+59PcuLUWJo9OCd+RfNg2uJRLUb6I/ARIg/OyAbAQIbRD7PEKNDPuDemsxB3NKYc1OAAtHu92ju6Qyh4DBhDoaPDgZ3QUWYUyRIEDFeTF5HpbIiJzbtrNL50UYLRwx6ZcxdZndhYwGJJTpy/FMcYORJT3wJoW08YLVifxx82fmYvtKC0EUOF3eLoOF0oPS5/kzlqFHMsmBxVmK42NU+CW3JG3Lr7WZEubW9TUTGpUK69Oy/Vr0m0nz5Z7QSkOFBRWkKdY6aLciYkiBV88P7lAootl4B8tKjXcmmOvFifeTwPOKtjynD0xRsXHQ/bMM2llgMJcRO9J6DYpPx06raVl10NCalSjRuavRsfidWIoRttRtxDV9w8zOYqims4QtTI5afWrHYifeHUeoXSsdGvYbLI8OurBsq1sFKgLkmA2wVx+cY3D3JsIKTNsA0MBvt9zKSupH/0kTgyjeFfLtZFAJFJqb3s5oFxkLhoSqSngK6sg/5SUWHERN3/Sa7IAW6vCUYww/7sk1jpocD8cL2XdULeGfkBkLTnqOjD/xrKmRyUj1rgSiwmxcPvgAgdnDUmrZTHpLdVxHrlN1mhwEzlBAiGT2Dx5JLfZcxJ9vdhemDOqZZeMfsl4C5ElHK2X/MDwyNyjN06lWRQpa660sxH/NsdwkXdyZlBS8KMuVytSdjH9R7Rf/eoKHiOjiLVycEasum2w4+7dRvSzE+56tX31gO+fMhdZPOWahbSJtCLz+xQXuzfw9zi79crmeTfGX7MZ0NnA8+owHjVJa8/voJ6KgXrvpFnA69t99XKqfWmA5HVHUzHYplDw4vINqPXk0QdfDFeq7XzHsdOPZcjs/uQHgAA/HH4AAAmcHAOQGH+xygjAuopO54Ha1JFIkEQagA0l/3U8Mscs5bd0xrBcAc6htz+5MPXE/1Ajd97fln7YMeWPOh5kVJsPE+RD2ytjR2cKbJItUBRd8PKQZ6MlUecX/sHY+UHXxLqjFUKAbx1tQEwefmH2koG9huBDE4EtRD2Mhv6qHZckoqL9cm21nQalHmEXWQI2iWTMAnBPEpF1NAgB9ToEPmMk1ThS1IF8IccDC8x3GE4e4lSHDcclgua7GAEIlagAAAAU15DimLCGECjCCnK6diRxoASLvJMOBXBSh3ayFa+aVR/17dEf0Fxpe6FZ39+19TGMfkmC4CKWUcwEvyIvmubY1/eWcpn83xVmt3WjhciT+HLtzux21CdTRGvfgnqIHa3maWnNynzwzChnpUx7L8oVV/VeIOzhDdmpuRQ/jMH7N6f//5lxzwAAPnDqwvThbK6Icn+nYzAo7ld/aZ0A3LWeROp54xI1osit2gI7No0ac5XCCmqeqlDNc/lCJpn0zWWfh307JZjTc2I4udRvkQOHnphdTAV4X6vZiIKo3f4nUGbkuB59S9gQCAkJ9uNoyJDkwr3tcDIu4YpLJAMT4d9FfNmHCopnKW6YsWCRU5bne4U3z9tz2UOrI8Lf0I07ldhwzGba4IpQAACkjlz5gbp2PFk+9+YX4nH5a1eHG7TEXlwprjoNGAWYqXY2ABiHAq9nW0aZtcznGfXq9sLNWapXHDV//VBHYrXtqhL2ZIAoSwM5KXoe32Z9Iqmuq/DZbQrRXvdxBbsVx5mLDfn+dhRjeFTdIGz2ER3zCP1UxbApAABs2dEufU+HpMmFEa9twCjYXqgG0sIWothZXgmeJEmN/bRlvaA/SOUoTl3eYMjdm+ZxIujuuTrvyZoahBqOd6dW+HQe5HHaZAG8kaslHNdSVTK0uu1ofbzwajkKFdevIpdJd8CXYnWK1DoaaonUxqTGbkzDDtBqCKHenX/ajrCno5DDVoAtmUmda0JwzvpbopF35TE41m5y4FmtXnzDarVf4oLXqALW9YZyCdiuEaQh0wiYLA6uEQfT2yN2JlHgADUzisZSdiYCTp9sHctBbPJwip+6dB8kkTwBTDeh878EfEZRmh1jwYjsd8UERFXZs885QyOX1/ipRjYyC4l8j0BNdCqMfcOCjwjVHa9FyExgVygQBTtJl7xBZv6McNM7m6vd83g0uGzlc1bWw/41rRA7hoclayUh1lxqlByQ1MijKN+8jcxmg5inkjzpZnlllQI5KNcf2Zwq8Y6NV/a5noVRMAz726fdE1PsPo8YwKI62cdRJwZqri056cRESJdYDmUiLurPjAPKuNuD5yaQt15RrWqYmO+x3uFlJvN+iowAAALxFDGIeB9NCSyI09Obk+e1x37K4nY0Aw6v68KwIbWWN8TZnZgsrxZMoC/VZASpZNHEqUR3TWckUfzWVcLXb4g26D9PzquXa3/VfNgSBcNFkpRFD7Bgbr/6ViobBcd18bEgJFRNz4h8ohr5SKEc2ncYpSgDmaM2GwHzdYmdQ2w8dQh/HYbpVjxOfgoYD2o8JbFwmD+BFO/9JrNB1MUWWiCnrTZ0pEymGT63LPFIGu0SqvIFk0HhWfdGPjnVfgAACE5W64NUO6kaNsOl8a3aA1k5V6cxzBxxxeeYm03E+Ucc6zflyRjTjpIpdRLy+EZpZq9BBcbpE/iH7H/njd0FIAg8qJt/KgjC+HpgWmyQg05Vnayhk0st1Os35touqLyL8QkiNHlnolc4uys3HylRK3jdQ4t8bUiIOfY4kqZhpxfOL/cuJoY0LfrAl1sKHKeIorhfnaOeoUjqFrHr6NmU9r9qBeiBoB+//1llJDUUUYTX6aNGVhYme96YSf1yn/Bd/wfCwA/6JQP1n8rf0zx7ayUuh9lgbQS32BendEXDSx4uwFrbJZFdZb+fg+qAACvQIxKOhq+bsRmgCtHYQOArJlEdnLYrxYsTURyF/CdiXIBgGUe1gv9fm2DSrLgBQapMuvFSyjzZqW5WsDRAyla7sbqMNCg1eIWFDyBmPHrQDFMDS8uYqruLRq8K2tuMj6RjW/MWzKj3N8/oe2v8lCpVH9db/SgeBWexijqwS2Zk/U3NAAxL2nRjpBqzKi5aKDRmyJYpVE5s0GuatOe7NgdOtnUqv2I0u54yc0LECc7uVmEMupGwcojDwDLeGmv3xfsV7Ntcicfm04qHHMF0imMG+XGubchwdifIBEDco2ZkgFDRnHK3yAAC1K01lUhpd4Cx3CCARMkDLpXq7qGlfwM8kqt3CjNres2CDDd9fiCB+YR5qdTUx5EThc/iXToXbg65DgARB+iCEDlvUmbrIMiOCvnu5ZNxWuzP8CrkIdzVW+JvkdRBXDRh2tyb9xKvy0JJifeDUBS07OrhHml2JtQhYz5NOqyUSFotjc7HsEhRXSMadqBGevg81fkW1fsEHstMsTerScj7lucvs7oDZ4glOi6LW24LMrwg2v4aoYpWa5lMfA4/apHyc6xt9thBv2ufc+b+6S+htECFjFgOFkJTSxqmD+riP6POqe0RA9zHfk8vvc1r3pxAAPxwkLKJiO4X2KDB0AOOlPBMBK87avjYblR3w7uMIhRQdlWgIrBg8m9wWxVnG0VpEA9rgmZOArJwpJ+WqBnjGPbZPrQSA3s6+czRVc66emFPQIWuBmwVorclnenmEMfUWb7+RNOhLp+09f6K1HYUJtGpi+A6pP0eTMDGXnDWIevd+E8e3IvHdhYU28+Z8LNZp+OmzTIcBm7CKgAcUpEPWrqio0oyvr5xyNb5Npm+hWPGIgu4PV56TzOael2mt8wQcn0LsjcePcQ9apd1Hy86huJzH3G9R+mEbdveHbT+NoS46cVglteoHN8f5I6uLNZwO8E0jHasrTddYZCPrZyYjaLRqslOhKI/wx5vY3jcMJTH3D/GLnaeF/ACHQyiRfPR72Kegdk0cosZRSRg4oZvdHCR2TBVnS84m0xPjBjDPuAi786mot5/TQY3rMsbueh491YGJqsMuFv3RRuRfP9GdA455+bdtGg0N27fdsbtqGJZhV/AIxHztSrJ6ktqE4j08AsOTYXsfgkHe8ZDi7Ml/WPUHSy1R8cL0IS1zfjHyFEiKUfjwwCgofEQzVTNKc4RW8fCMWVKTAs1MYRslSMRBg19uogmoHgc5d1maayZCA7+Ao9xmI1+ps9zgRUdZhW0HAcxz9AH5H4rJS3fZitvE0JnbWz/B7IJbRRMVPQ3DVp2Y2DaS/DqBW//kD3p0wsIwni4DEGNRHTRA+/bE3bsHR0AlPK4WQkZGYOLEMcAtE5s4iiAkuRYJoJhQUjY1bYxGH2JKWABRCfzwBdGYPyV4WKZbgd/F7SnoMRdaSrSzLNXMAr3pDe2fOjXCh4tQbhubMvpCa/h1rXoaFKXGTo+sQ46PLPqL2N+sHYBrPiFb/2+H4nMiZygys3us+UQsNxbxfgnc/EwmlKokTNRADGMUQt1f8ck0rf+xoClVcf6YPBR+RevGnQdYM15fuqzMULPG0BosGn2TWochSCB+XrpcPxRzTO6LgcO+ehiIXfPopoJVoti3qp38jvnz9RowOBo8Nuv2uLh1/kR2qYEMxSg/uNHn4wQRXP2v722mXD/rZlk2+n9GamsS16JzCfSyTVysSsRCdnQp8OiOKETdWwCPCJLjDRHxQCOFkB5gyhPYqOMDK7HgcdVh9y7mEEJuDHBQL1BqOkMVQH/POKPZ+ELsjx1ad8pCTOpzBh0CZWw4qNztdaH0qw7eSEVkQiFhxV2rp2u6TR6VxbHLUMe3yZWdFoG5VsRjtFGKLjJX3u67f2kzUMb2P7jhXmEOUp58q4GVv0O6r7OAtaT0labZ99z/TQlX+bC2Wbt/2Y3gH2SLxslRtml+BgD4nYwm9aI6w0ozhBgyv7FQR8y+/twoes1ePfKrkWJdTPmm8QRxDDUZdMbh2PtJ76N8g+SLOL93iTHE2AzRQH2ETCacqtPA/PRRW4bmpJgA0rkflk5F41RKHWcCK6eofxyEDUIvC2lZKBV3IwVYxmndR/86g/jhv7zTNZk3h39By//ae2vcTFxGT2Epibxh/emFuf9nYEUYa76jrfEwS1VOD9TvRIxXbtW3Mkk7rumUQ5xTLtqUiYcxSjTmOPoUzFJ21Rz2qiez1WXcGzwuI8rWw5HMhyFOJL3f4izgeLEiq0EZ0B1dghyM+4EYOCqw5Zc3E5UQO0JBS3D7pDBQNbPbPBrwzhdetf6ClhWQcuOAjaRxTVp5czVqCzJyEwF2I8sZdUQvzUZt6cC2m9xaiVLtx8ofclMV/mjLHb4dGqXeeGFy6tKG68QrDI4A52no68blSALgSh98JzM/qpKesw6oyOrsM+15mHl1C2uRA413Kl7zSH1MSy20zRmniHqGaUAWjpp+FMpGme0yAeNvCBk/aJEZ24o3/Awwm57XC1ipDNCZPLW+Lvb9MlAHL8Mc/D81GVOlO1Q4qNu42KKuOyi74AHDleOPu1sxPzgWX5U9iwJTSIgO1mpKOOM8th+pNP4VVev1jP/DJzhiq7UWywnPFY9RPeA/Gu0r2IREgkSq0uoEHAS7vHh1KVVR2qCjs4fBHMzG/bTRGEUYdiDfG5NtvFL64gPN5ueZ4ZUWehGMRWiXyn5yCl7IQGFkM+B/WU7NEysXlA9GTfwc2oZ4pjWm7yQ4VY6MpV8kBNYKm3nmIW9gIAaC4TeLCzgvjAimsM8vpVSssykFBI/DieBOOXSREZ+dqG0crnmohZnGe9p9xlMwjHlGswS/DabD6+f8Tp/lSH29T2lE8yBV6CzghUpGJRc1i+dMQ/vELrLh7hiVjGf0k230bh8ccEu7sahvblAsD3YsPmM6dIo/zgaOMZ3Scm974GLUtSldS+9ay4ptsw0U97mRdT/aI4cyyOysY3GMzLTEFjcwfIbdPj6ARH9A4Qp+JFv13f" + "RKLltxVuxo+83Ttq20khTC9yz09DKBLAeOsg6MpY/ORoT9rSBx70nogkAqiKeGdDFGX8A5KLM2ivRxjRMUDsj8QNx/0xx0qtlJ+bGWbiMkVQB58LDNpoJM54RnquCAauOlug36n6t+LQ8oQEOJ//5qMk+dzhaJe899lVesIfceKZgmWl2qn1/0WaE3mKNXxFP2sdWhJrmviXKLAktoJmIr9GImWSOhABrS1DNl4BUy75cfkC7wiDPwSBx2886mwWkuSb6qmJ285BSNTn3kQJoXOTd4Ktr9entXJUeyjrhmobJsuMvaV4WC3XICSrToKC60mSnxmJpjx7Cal4dlFAiZjbhP4T1kS2zUQjik7hB2jzciIbKbI6+RDpncKz/qBRvBHjs6uByNNtAwLTNXsv2uCZCn9Wwt21OYiF+wWMixGZKCGxsWE2C6HC9MJPFk79Zgp+Q3Y49Tr0RbamppzFkY8SDKT0/xtMdOohNatZJpDAuq9WWKB94GmBhxHdy8x3K/L9mvP1uH+Cntmtq3RN+O/59cY2t82GUosLDOC3VJcxt27DUtKXFoKiyoTU8Zi3X1JEKSk0f+l+Iet348+FPaVzEFSoGqhl262hGB10e13Mdpl8dIiNwQ8LeYJHrMeCZDruqgW2i5QqXfSSchQa40Gp+7bSp6v72VCSk4SpPqYdSfKxYY0qf8lTmYHN8ds6k0QarHCtUkANEEQ61oXPFMJ9GGoSDruXB6sR4kdZhnmN/zPFwlRn9Otj+T4aoZpOB2oSI+fDMtlQDQp9eR5l1zXxZ6iIVRPuHdM6QkXk7BpUfuysxoUiJOWeVCVgwl++qMJotB03xH4YCDbQHNlE0PViKKnjoTJwqG3BE7qzrtKhUbHlFd15HZZgGszyY03+NTrgYR+r/VReUVRoM3mWwzxx2EBBfIQzpuqkIj2+IwbFCtQDCQiZaeSPO7s7I3wC0BPIxAnngczh5XiobW0SxzKl+xPed/KN3DnFupxyugl1XQ56IaJUG2WT6bGqEX3XxYA6KWOVzY9mGDSOP5VYZUmjyOksjNoIXABad+MpJkfM0CuGiR0xqkFgnCYfjEs+q37yuZdHkIeeyR5xFKUDt8nn9IWOIE0iZog/jkgCzpqciPIMlDUjewdqwc4JxBCt1A8tvdBvHLC5k4XfAnml8KVZY53eMO3m8OmUG5D4wh3lfVORBNj8Swhd7Ea0wtB8S8C5n9Rfn4hSBvLnQUib2bcEABWqbDpbu7tyXIFCqtxwN5TH2visH0W+XGUFeBGuw32ESU533r1A56MkzwQ+Hfd78KGnIyr9QPzUhbycUjDShOzCgA5SCxfJiT3kXRmnvwbhS6Pn2rTxqPNE9wgcgY+ER/+b3iYxFOwh6Rg7ljrJ42rFT1c6dvoAr9xwwXaA6VO0V9ow+7+9xyYVnZSUe5z0RPaSgA/pyUlvi09zwRAAVlYymwzN6gcPqUiSnVfUE2TUGcsqQbnSlsvInvO2V6+xOjsoS2ttCfIriNL7RtUW4uA71EWpKtvzB4HBrYWpL3IfmGTegQlnkeHBOmELEgsdWMg+jc314Ofw1/3mbebYJb5ErbaVX8yfSruM/1WkucULNGFwvPRoUD1WbTrnpWMFrC+kGzHyxJqoWWw8QK3w0qN55eum0/rVIIeqGsSpaZQLi04AF/NK2sfBdyKAA1NmI/dioWgNNEHpprAg3HMivrrftya89LsEZ2C67M1tz5NKorgSXXTqUKZIMJyPCzoc+fRjwn+o/zVh6inf6QqpgP2tM7CkWq93KNEkA76OBYKog7kcy5sZSDVOEhLGDvw2sguHySvHN6T1Zea9SeG+i1ua7prgxjXZXVaRs+uy8c4mREMG7BMGr5ZAOoiXeXT2C/yeGHKk7esYic3GLwueV9ErLS0mH5N0CeJAS2Q8KjyQXtZM8Uu2mOc1WEUSxpeMAaTRzLsPLnVl6nNSIPVlpLqMa7YoerVgf7qiYkTFPHxY8a/kO+NlKCaD9IJBqavsJa9MeDhj+tZycfV/2J0OAJO4McSUjsv9B2EpfSX5lOGIclOOQ13MR01d1a9r8hiRHuoeu7YVdY81h5BbyH9z61igPLhbWoN7Y2x+YODgrcd9eU49eyZas1oX3hY+1xwS/oK2p3O7dqeIuBGWUJXUKVsoK0zBzipA8sYiUorEmtfyY1jLUZEIVxu/aMExDGGwgatdbXV7cBiYUFcalxajWYRyBIez6/pAyiWU97etZ6IShotG+B1HlOfT31kps+ZtQeg8m/P12Wh4j/Y91S7EFYj8QaqcLJQdCMlKQ9snEaUTz9Qde3ry1jFFFpUFFlw1L8SbTaDy3P/dUo8mQMd2BdWASxU2vgV83NOoORJ1h64oOGNwIUtlZCIMrz+ED77DG8OlHfto/O1b2mXmD0GfjTcYVzEoxBE/gMW3w9E3uag/lmE0yWgWokb24u6h8ew60RVaPhSdIGCzoHi02GsziQozyZh/1r1YkkTAgO1eGfj6/vt3I2IHczaYNeDIAaXE7265ej5k369/iLTP4nAnV907Njg+ymconp/Jx+1WZyzjvz5Hu8cBCXTsIKnhp4fSx+oeEmlrkEKGSI0vfEmtt1e+BupsCOJ+tb7jGevHpXBb66sGgALn6fn/5HqilYEWHGrUY8bco6I0mrjMESrDaVyGjNuvcr8VX5X1Z5g30aOPeikFd7dXwqJVOubqDn2MX1JOOJm/XGHym2a6912ENmbJYzFvtIAoI1k+WrnLI6U8bcPnfUnK2JukxQlaaB1MZrV7UFwqxvHqrzP1+FxBlxm2iWpLYdxEzVMS0xHs1NEB4vYQ8GUNQqVGOTLFPi8k9KMzImutFRZ9u+712uO0zQHdut8NqsTEvaFhHbx5vBxg1TpRfp75npbxp64f//zDQT+GextdvgIRX3wjaEoc3DPsHHw30BUASAgY36Jr3gu5XnbwG2CDHmmScid67W5EaHCBuizd4fpn4AKp/U2xhwyo3fd+vLBIl0d9V/Gotvx0rWehQtWJ1RKF+vD5ms9qXZn+XPBlxiGxS1x35eNsopc51JReTKm1pdAJjPzb/17nfIL+bMC353pktm0UJXezZCPtKqhFOskgwFgcLgjKrgX2MDRTc/Mn/dOxQH9bALuH1HT2QlmVl9kO5Gw8ddk3fI6DkRnzmhkTarZ6RU/AWK8boCOp6HfPMEuz8TbH8t56xUt1W3rT0f1cxeJ+p5F8WijG8GOr+TIeko85jN9PSfokRlfPA5hpzMSHpDvBloaLHFZVPqeTAhNW7MjRpvVI6p2VyI5AzqXhgMOH2qGxrW8n+wdb93nclHUyE7J88DN08bOrLk5+AI+5jqhRdrqQyrfEalg3naAxRUNHX2u0TUCqEU9ZRyim5gjHVtYl61hugnGXxkqt2qoaZKTlabuqvoHJle2KqGXXFwVia+xrzZ8girteS0pb3fRnB8+tBAsQFgst/FK79XstMa07vOzSt0klZVzgszFpGV4+gNC7foAa15Aj5dWahqg6y3pv21dPSxC5p+aYVx3D/uAahcz23Mn9dQnLzX+Xu/zmVpiGjFneSUARYi4FXijPgvE/OBuosgcpJzYUn3vU+2a52KQFz1QmKD9pzISfLGUAqH9SIgSr581LoqLeF2Q0Kzqcd9g66x5nKgwrvbuUqjG07JSJ82QvscGuLxugKDELTaWpEfmhPWFlPG7q8D0rApduSD0W+48edDqG9aPUOPWMU5FnuBwPgou4lf616TDTg04eMR49EuztaR+cSzYQDznlOuRbHOlibjGzfR3iNENC02PflSqhFb8w4QJQTrwgHrf3UGGmqWeSW+yKdqI/G7XHwLXUC64PDdwbjIJ9ZO5rS0axwgvXLCud9jPp7i8kOL0ZsPQyoEsMeFoLoK7aZzRLSAYY35SmkcQlrOAOj51yqVTQSChzpXy9rfdDJfBDrzYWX0MXGLQv+JSAZ4y29kQ1NKODPx40kT0AbSHqkTtORFhUdxLuxsU/xwRa688xiUtGVRbDYrqI5l0fKOYwAfa7wC3qyYolyuNpYKzKKj2s4xGOWpACgXTB+fTJgPx7dWQ7n8+T40IMZAPuX2cABUoqhsGzuVEbYV17r4fRrjphaV/tg9f6B2Ks9+WzMlCoSRfV/L3zFJtF/bw0VZmEuTs+nwNymj5H95AniMaRc40y7T6y/3YXkanb+S5KJCKiPZn8sKk4i7pEVfU+a8TAmTg2ueFqEIwhCITTYEKrV0zpK/tzW4qfMFuN6BixbHF3oDLZV00t16j0GplHcPeNgJ9gXeZxnY5kPKxav3/uhanaglTGPZNCXn2dQauDtMfxbrkbDVkV1EuVc+S8XAADj6Jvzpegp1NODsk9qj7fqg7BVWkjN4GGrZqt3kdEhLWcdktke7A7l7abDDO/plupCO/AfiZeCKBBZ0sQYMAAAAA=";
})();
(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".site-header");
  const progress = document.getElementById("scrollProgress");
  const menuButton = document.getElementById("menuButton");
  const mobileNav = document.getElementById("mobileNav");
  const cursor = document.querySelector(".cursor-orb");
  const langButtons = document.querySelectorAll("[data-lang-button]");
  const translated = document.querySelectorAll("[data-es][data-en]");
  const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]');

  const preferredLanguage = () => {
    try {
      const saved = localStorage.getItem("portfolio-language");
      if (saved === "es" || saved === "en") return saved;
    } catch (_) {}
    return navigator.language && navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
  };

  const setLanguage = (language) => {
    const lang = language === "en" ? "en" : "es";
    root.lang = lang;

    translated.forEach((node) => {
      const value = node.getAttribute("data-" + lang);
      if (value !== null) node.textContent = value;
    });

    langButtons.forEach((button) => {
      const active = button.getAttribute("data-lang-button") === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    try {
      localStorage.setItem("portfolio-language", lang);
    } catch (_) {}
  };

  langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.getAttribute("data-lang-button")));
  });

  setLanguage(preferredLanguage());

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
      body.classList.toggle("menu-open", !open);
    });

    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    if (progress) progress.style.width = pct + "%";
    if (header) header.classList.toggle("is-scrolled", scrollTop > 12);
  };

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScroll();
      scrollTicking = false;
    });
  }, { passive: true });
  updateScroll();

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const sectionIds = ["work", "capabilities", "experience", "about", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) return;
      const activeId = visible[0].target.id;

      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === "#" + activeId;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-35% 0px -50% 0px",
      threshold: [0, 0.1, 0.3, 0.6]
    });

    sections.forEach((section) => navObserver.observe(section));
  }

  if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      cursor.style.transform = "translate3d(" + currentX + "px," + currentY + "px,0)";
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }

  const heroVisual = document.querySelector(".portrait-frame");
  if (heroVisual && !reduceMotion && window.matchMedia("(min-width: 861px)").matches) {
    let parallaxTicking = false;
    const updateParallax = () => {
      const amount = Math.min(22, window.scrollY * 0.035);
      heroVisual.style.transform = "translate3d(0," + amount + "px,0)";
      parallaxTicking = false;
    };

    window.addEventListener("scroll", () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    }, { passive: true });
  }
})();