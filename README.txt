Mi Rutina App.

Puesta en marcha del proyecto desde el ordenador:

Instalar Ionic

DESDE CMD: UBICARSE EN LA CARPETA RAIZ DEL PROYECTO Y EJECUTAR 
ionic serve --prod

DESDE VISUAL STUDIO CODE ABRIR LA CARPETA DEL PROYECTO, ABRIR NUEVA TERMINAL Y EJECUTAR
ionic serve --prod

(Funciona sin el --prod, pero será la forma óptima de que se visualice como lo haría en un dispositivo)

Una vez hecho eso se abrirá el navegador con el proyecto en http://localhost:8100/. 

En chrome pulsar F12 y hacer click en el icono para la vista de dispositivo movil.
Podremos ajustar dimensiones o dispositivos para ver como se adapta la aplicación.
En las tabs de la nueva ventana solo nos interesan 2 cosas:

Console: Mensajes de depuración y posibles errores o warnings
Application: IndexedDB->_pouch_myappdb Por aqui podemos consultar como va la base de datos o borrarla completamente en último caso por si algo no fuese bien. Nota: Se puede hacer desde la aplicación pero mantendrá registros de borrada. Desde el navegador se elimina completamente, puede resolver algún error.

Con la aplicación abierta. El primer paso será pulsar el botón rojo de Reiniciar Base de Datos la cual cargará diversa información por defecto tales como varios ejercicios y un usuario con una rutina que contiene varios dias/sesiones de entreno de varios ejercicios y un historial de varios días de entreno de dichas sesiones para poder testear la aplicación.

Si se desea se puede crear un usuario nuevo y ser funcional. Los pasos para nuevos usuarios son:

Crear Nuevo -> introducir usuario y un email con formato valido (algo@algo.algo). Elegir un avatar o quedarse el que aleatoriamente asigna por defecto. ->Guardar Usuario

Hecho esto tocaremos en nuestro nuevo usuario.

En la aplicacion tendremos 4 tabs:

1.Mis Rutinas:
	 - Lo primero que tendremos que crear es una rutina y dentro de ella añadirle días.
 	 - Al crearla ya se crea tambien el primer día con los ejercicios que incluyamos, estableciendo la cantidad de series y 	repeticiones para cada uno y notas si fuese necesario. 
	 - Se puede poner el mismo ejercicio varias veces en un dia por si lo realizamos bajo ciertas condiciones específicas.
	 - Una vez creada la rutina podremos eliminar la rutina, editar su descripción y gestionar sus dias/sesiones añadiendo 	editando o eliminando cada día.
	 - Para cada día podemos editar sus ejercicios, eliminarlos o añadir nuevos.
	

2.Ejercicios:
	 - Podemos ver los ejercicios "por defecto", añadir nuevos y/o editar/elimnar los creados por usuario(icono usuario).

3.Entrenar:
 	 - Siempre que tengamos creada alguna rutina con al menos un Dia/Sesion esatblecido podremos comenzar su entreno.
 	 - Si no es la primera vez que entrenamos vendremos una tarjeta desplegable con los datos del último entreno.
 	 - Si tenemos varias rutinas y/o dias debemos elegir cual queremos ( por defecto sugerírá el Dia/Sesión siguiente al último)
 	 - Si no es la primera vez que realizamos una sesión, tendremos sugerencias de peso para los ejerciciose indicado en rojo el peso  de la sesión anterior para cada serie.
	 - Para cada ejercicio veremos un X/X indicando la cantidad de series a realizar para cada ejercicio.
	 - Al desplegar cada ejercicio veremos una serie en curso, El peso / repeticiones no podrá ser 0 para confirmarla en OK. Una vez confirmada se muestra la siguiente.
	 - Al confirmar la ultima serie, se cierra la tarjeta y se pone en verde. Podemos volver a abrirla y veremos opciones para añadir series extra por si hemos decidiro realizar más.
 	 - Podremos finalizar el entrenamiento cuando al menos tengamos completo uno de los ejercicios, aunque veremos una alerta de que faltan ejercicios por terminar si es así. 
	 - Cuando algún ejercicio queda incompleto o no se hace nada 	se reflejará en el historial.
 	 - Para todos los ejercicios y series podemos añadir notas.

4.Historial:
 	 - Aquí se irán registrando todas las sesiones realizadas con la fecha. Podremos eliminar un registro o incluso editarlo.
 	 - Se mostrará cada serie, cada peso, cada nota,etc.

El usuario Autousuario ya tendrá datos de todo esto por si queremos probar sin más.

En caso de no tener información de algún tipo, se verá un mensaje indicándolo.