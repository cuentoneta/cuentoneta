<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

## Campañas de contenido

### ¿Qué es una campaña de contenido?

Denominamos como **campaña de contenido** a una característica del sistema que tiene como objetivo principal la difusión, en un espacio de tiempo particular, de un contenido específico. Este contenido puede ser una storylist, una story particular, el perfil de un autor, etc. Cualquier tipo de contenido enrutable en la web, tanto dentro como fuera de la plataforma, es susceptible de ser parte de una campaña de contenido.

El carrusel superior visualizado en la web es el espacio destinado a las campaña de contenido vigentes. En este banner se muestra una imagen, un título y una descripción que invita al usuario a interactuar con el contenido de la campaña y permite, en el tiempo, la difusión por redes sociales y otros medios de comunicación.

---

### ¿Cómo se crea una campaña de contenido?

Para crear una campaña de contenido se requiere:

- **Títulos**
  - Se requiere de un título de máximo 32 caracteres para visualizarse en dispositivos móviles
  - Opcionalmente, puede adjuntarse otro título diferente de hasta 40 caracteres para visualizarse en dispositivos de escritorio y tablets
- **Subtítulos**
  - Se requiere de una descripción de máximo 36 caracteres para visualizarse en dispositivos móviles
  - Opcionalmente, puede adjuntarse otra descripción de hasta 60 caracteres para visualizars en dispositivos de escritorio y tablets
- **Imágenes**
  - Una imagen de estrictamente `960px x 280px` para presentar la campaña en dispositivos de escritorio y tablets
  - Una imagen de `540px x 220px` para presentar la campaña en dispositivos móviles
- **Descripción**
  - Un cuerpo de texto que describa la campaña.
- **Un enlace**
  - Un enlace que redirija al contenido que se desea difundir mediante la campaña.

En todos los casos donde se indican requerimientos de recursos de tipo texto es posible la inclusión de texto enriquecido, lo cual permite utilizar negritas, itálicas, emojis etc.

Para que una campaña de contenido sea visible como tal en la plataforma la misma debe, además, ser añadida a una configuración de landing page. Cuando esa configuración de landing page se encuentra activa se procede luego a la visualización de la campaña de contenido en la plataforma. Si bien no es condición necesaria para generar una campaña de contenido el que ésta se encuentre agregada a una configuración de landing page activa, sí es requerido para lograr su visualización en la plataforma en una semana dada. Para más información al respecto, debe referirse a la sección [Generación Automática de Configuraciones de Landing Pages](#generación-automática-de-configuraciones-de-landing-pages)

---

### Ejemplo

Una campaña de contenido incluida actualmente en La Cuentoneta es la que referencia a la storylist ["Cuentos de terror con Alberto Laiseca"](https://www.cuentoneta.ar/storylist/cuentos-de-terror-de-alberto-laiseca). Esta campaña tiene la siguiente estructura, pudiendo observarse que el título es el mismo para ambos tamaños de pantalla pero los subtítulos son diferentes:

#### Imágenes

Se requieren imágenes en dos tamaños, recomendándose la adaptación visual de los elementos de cada una para ajustarse a los dispositivos donde se visualizarán, tal como se muestra para este ejemplo:

Móviles (540px x 220px)

<img width="540" height="220" alt="image" src="https://github.com/user-attachments/assets/22920c17-7cbf-433c-8f9c-4a319d9ead74" />

Escritorio y tablets (1240px x 360px)

<img width="1240" height="360" alt="image" src="https://github.com/user-attachments/assets/8c949a47-a4e6-46dd-8953-28ae6081be23" />

### Descripción

"Recopilación de los cuentos relatados por Alberto Laiseca en el programa **_Cuentos de Terror con Alberto Laiseca_**, originalmente emitido en la señal iSAT entre 2002 y 2005."

### Enlace

https://www.cuentoneta.ar/storylist/cuentos-de-terror-de-alberto-laiseca

---

## Generación Automática de Configuraciones de Landing Pages

Aunque las campañas de contenido pueden crearse y editarse manualmente en Sanity Studio, las configuraciones de landing pages que las contienen se generan automáticamente mediante cron jobs. Para comprender **cómo se generan automáticamente las configuraciones de landing pages** que albergan estas campañas, incluyendo el patrón de contenido rotativo (`rotatingContent`), consulta la documentación sobre [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md).

Esto permite que los editores se enfoquen en actualizar y curar el contenido, mientras que los procesos automáticos se encargan de mantener la estructura y las configuraciones sincronizadas.
