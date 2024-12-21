"# avanti-scraping" 
1- ejecutar "npm i"
2- acceder a la carpeta desde la consola src/scripts
3- eliminar el archivo "modifiedPage.txt" en caso de que exista
4- ejecutar node demoScrapping.ts 

**Explicacion**
en este linea await page.goto('https://citytv.eltiempo.com/noticias/orden-publico'); se agrega el link de la pagina.

luego de ejecutar el script se crea el archivo "modifiedPage.txt" el cual tiene el scraping de la pagina lo mas resumido posible, el objetivo es enviar este resultado a la IA, en esta prueba se hizo con colab:
https://colab.research.google.com/drive/1ZZAuX3qa0G6hkyHPw_t1GLg7dzSterC0#scrollTo=w74JkoMMENB6