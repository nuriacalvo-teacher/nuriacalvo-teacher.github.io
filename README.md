# Nuria Calvo · English Apps

Página principal de **Nuria Calvo**, profesora de Inglés del IES Goya (Zaragoza).
Reúne, organizadas por temas y cursos, las aplicaciones educativas publicadas en
esta cuenta de GitHub.

🔗 **https://nuriacalvo-teacher.github.io**

| Fichero | Para qué sirve |
|---|---|
| `index.html` | La página. No hace falta tocarla nunca. |
| `apps.json` | **El catálogo.** Aquí se decide qué apps se ven y en qué orden. |

Cada app vive en su propio repositorio (`present-tenses`, `irregular-verbs`,
`habits`…). Esta página solo las enlaza: **no hay que copiar nada aquí** cuando
crees una app nueva.

---

## Añadir una app nueva (sin tocar código)

Cada vez que subas una app nueva a GitHub:

1. Abre la página y pulsa el botón **⚙️ Profesora** (arriba a la derecha).
2. Escribe la contraseña (por defecto: `nuria123`).
3. Ve a la pestaña **Repositorios de GitHub** y pulsa **Cargar mis repositorios**.
   Aparecerán *todos* tus repositorios, incluidos los que no tienen nada que ver
   con inglés.
4. Marca **solo** los que quieras publicar y pulsa **Añadir seleccionados al catálogo**.
5. En la pestaña **Mis apps**, pulsa el lápiz ✏️ de cada app nueva para ponerle
   título, descripción, curso, tema, color e icono.
6. Ve a **Publicar cambios** → **Descargar apps.json**.
7. Sube ese fichero a este repositorio: entra en `apps.json`, pulsa el lápiz ✏️,
   borra todo, pega el contenido nuevo y pulsa **Commit changes**.

En un minuto la página muestra los cambios al alumnado.

> **Importante:** lo que editas en el panel se guarda solo en tu navegador hasta
> que subes el `apps.json` a GitHub. Mientras tanto verás abajo el aviso
> *«Vista previa local sin publicar»*: nadie más ve esos cambios.

## Las cosas del día a día

- **Ocultar o mostrar una app:** el interruptor de la izquierda en «Mis apps».
  Las apps ocultas siguen en el catálogo, pero no las ve nadie.
- **Cambiar el orden:** las flechas ↑ ↓. Ese es el orden que ve el alumnado con
  la opción *«Orden de la profesora»*.
- **Destacar en la portada:** la estrella ★. Las destacadas salen arriba del todo.
- **Marcar como «Próximamente»:** en el lápiz ✏️, campo *Estado*. La app aparece
  anunciada pero sin enlace, hasta que la termines.
- **Cambiar tu nombre, centro o el texto de portada:** pestaña *Portada y perfil*.

## En clase

- El botón **QR** de cada tarjeta abre un código QR grande para proyectar: el
  alumnado lo escanea con el móvil y entra directamente a la app.
- **Imprimir listado** (al final de la página) saca en papel todas las apps con
  sus direcciones.
- El portal se ve en **modo claro u oscuro** (botón ☀️/🌙); el modo claro va mejor
  en proyectores con mucha luz ambiente.
- Atajo: la tecla `/` lleva directamente al buscador.

---

## Detalles técnicos

- Una sola página, sin instalación, sin servidor y sin base de datos: lee
  `apps.json` y lo pinta.
- Si `apps.json` no se puede leer (por ejemplo al abrir el fichero desde el disco
  con doble clic), la página usa una copia de seguridad del catálogo que lleva
  incrustada, así nunca se ve vacía.
- La página **no llama a la API de GitHub cuando entra el alumnado**: eso se hace
  solo dentro del panel de profesora. Si lo hiciera en cada visita, un aula
  entera compartiendo la misma conexión agotaría el límite de peticiones de
  GitHub y la página fallaría.
- Campos de cada app en `apps.json`: `title`, `subtitle`, `description`,
  `category`, `levels`, `tags`, `icon`, `accent`, `status` (`live` / `beta` /
  `soon`), `featured`, `visible`, `url`, `repo`, `updated`.

### Cambiar la bio de «Sobre mí»

El texto de la sección *Sobre mí* está en `apps.json`, dentro del apartado
`about`. Se edita igual que el resto: entra en `apps.json` en GitHub, pulsa el
lápiz ✏️, cambia el texto entre comillas y haz *Commit changes*.

- `headline` → la frase grande bajo tu nombre.
- `highlights` → las cuatro cifras destacadas (`value` es el número, `label` el texto).
- `sections` → cada bloque de colores, con su `title`, `icon`, `accent` (color)
  y sus `paragraphs`. Además, cada bloque admite:
  - `feature` → el recuadro destacado de arriba (como «Krisenka Finley»), con
    `icon`, `title` y `text`.
  - `chips` → etiquetas sueltas, como los idiomas.
  - `lists` → una o varias listas (discografía, cortometrajes…), cada una con su
    `title`, su `icon`, sus `items` y, si quieres, una `note` en cursiva debajo.
  - Cada elemento de una lista es `{ "name": "...", "meta": "año o lugar",
    "url": "enlace opcional" }`.
- `closing` → el bloque final, con su `quote` en cursiva.

Dentro de un párrafo, lo que pongas entre dos asteriscos sale **en negrita**:
`Obtuve el **n.º 1 en las oposiciones**` se ve como *Obtuve el* **n.º 1 en las
oposiciones**. No se admite ningún otro código: cualquier otra cosa se muestra
tal cual, así que no se puede romper la página escribiendo texto.

### Añadir enlaces a los discos o a los cortometrajes

Cada disco y cada cortometraje tiene un campo `url` vacío. En cuanto tengas el
enlace, lo pegas entre las comillas y esa fila se vuelve pinchable sola (con su
flechita de «se abre en otra pestaña»):

```json
{ "name": "Wasteland", "meta": "2003", "url": "https://open.spotify.com/album/..." }
```

Si lo dejas vacío, la fila se ve igual pero no enlaza a ningún sitio. No hay que
tocar nada más.

**Para los vídeos:** en GitHub no caben (el límite por fichero son 100 MB y tus
cortos ocupan 2-3 GB cada uno). Lo que va en `url` es el enlace a donde los
tengas alojados: YouTube, Vimeo o Google Drive. Si usas Drive, el enlace tiene
que estar compartido como *«Cualquier persona con el enlace»*, o quien entre en
la web verá una pantalla pidiendo permiso.

### Poner tu foto en lugar de las iniciales

En `apps.json`, dentro de `teacher`, añade una línea con la dirección de la
imagen:

```json
"photo": "https://nuriacalvo-teacher.github.io/nuriacalvo-teacher.github.io/foto.jpg",
```

Lo más cómodo es subir la foto a este mismo repositorio (cuadrada, 600×600 px
aproximadamente) y poner solo `"photo": "foto.jpg"`. Si no pones nada, se siguen
viendo las iniciales sobre el fondo de color.

### Cambiar la contraseña del panel

En `index.html`, busca la línea:

```js
const TEACHER_KEY = 'nuria123';
```

y cambia el texto entre comillas. Ten en cuenta que es una contraseña de
conveniencia, no de seguridad: sirve para que nadie toque el panel sin querer,
pero cualquiera que mire el código de la página puede leerla. No pasa nada,
porque el panel solo genera un fichero que luego subes tú a GitHub: nadie puede
modificar la web desde ahí.

---

## Tema decorativo «Around the English-speaking world»

Es una capa **solo estética**, separada del resto: no cambia el contenido, el
catálogo, el panel de profesora ni el modo claro/oscuro. Está en la carpeta
`tema/` y se carga con tres líneas de `index.html` (un CSS y dos scripts).

- **Portada:** un horizonte con paralaje (se mueve con el scroll y el ratón)
  que recorre el mundo anglosajón:
  - Londres: Big Ben con las agujas en marcha, London Eye girando, Tower
    Bridge y cabina roja.
  - Nueva York: Estatua de la Libertad con la antorcha encendida, Empire
    State y Chrysler.
  - Dublín e Irlanda: Ha'penny Bridge con sus farolas, la torre redonda de
    Glendalough, una cruz celta y la bandera irlandesa ondeando.
  - Toronto: CN Tower.
  - Sídney: Ópera y Harbour Bridge.
- **Animaciones:** un autobús de dos pisos, un taxi amarillo, un canguro (con
  su cría en la bolsa) que cruza saltando y un duende irlandés que baila una
  jiga junto a su olla de oro bajo un arcoíris. También pasa una avioneta con
  la pancarta «Hello! · Dia duit! · G'day! · Howdy!». También
  aparecen bocadillos con saludos de cada país y ventanas que se encienden de
  noche. En modo claro hay nubes y en modo oscuro, estrellas.
- **Toda la página:** tréboles verdes, hojas de arce y estrellas que caen
  despacio, e iconos muy suaves que se desplazan con el scroll (Big Ben,
  cabina, taza de té, Estatua de la Libertad, Ópera, canguro, trébol, arpa
  celta, guitarra folk) y una barra de progreso de
  lectura con los colores de la marca.
- **Música** (botón ♪ en la cabecera): un popurrí de melodías tradicionales
  (de dominio público) tocadas despacio con flauta o tin whistle, arpa y un
  colchón de cuerdas:
  - *Greensleeves* (Inglaterra);
  - *The Irish Washerwoman* (Irlanda);
  - *Amazing Grace* (EE. UU.);
  - *Auld Lang Syne* (Escocia).

  Entre canción y canción suena un didgeridoo con clapsticks (Australia) o
  las campanadas del Big Ben. Se genera en el navegador (no hay ficheros de
  audio) y empieza con el primer clic. Suenan efectos suaves al
  pasar por las tarjetas, al abrir una app y al cambiar de tema.
- Usa la misma paleta del portal: índigo, violeta, rosa y azul cielo.
- El portal se abre en **modo noche** por defecto. Si alguien pulsa ☀️, se
  recuerda su elección.
- No sale al imprimir y respeta la opción del sistema «reducir movimiento».
- Si algo del tema fallara, el portal sigue funcionando igual.
- **Para quitarlo:** borra las tres líneas de `index.html` que apuntan a
  `tema/`.
