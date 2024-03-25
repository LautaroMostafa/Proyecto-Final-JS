function cargarProductos() {
    fetch("./productos.json")
        .then(resp => resp.json())
        .then(info => {
            productos = info
            mostrarProductosCarrito()
            ajustarStockSegunCarrito()
            mostrarProductos(productos)
        })
        .catch(error => alerta("Algo salió mal", error, "error", null, false))
}

function ajustarStockSegunCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || []
    carrito.forEach(item => {
        let productoEnCarrito = productos.find(producto => producto.id === item.id)
        if (productoEnCarrito) {
            productoEnCarrito.stock -= item.cantidad
        }
    })
}

function mostrarProductosCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || []
    let productosEnCarrito = []

    carrito.forEach(producto => {
        let productoEnCarrito = productos.find(item => item.id === producto.id)
        if (productoEnCarrito) {
            productosEnCarrito.push(productoEnCarrito)
        }
    })
    productosEnCarrito.forEach(productoEnCarrito => {
        infoProductosCarrito(productoEnCarrito, productos)
    })
    document.getElementById("cantidadSeleccionadaN").textContent = calcularCantidadSeleccionada()
}

function calcularCantidadSeleccionada() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || []
    let cantidadSeleccionada = 0

    carrito.forEach(item => {
        cantidadSeleccionada += item.cantidad
    })
    return cantidadSeleccionada
}

function filtradoCategorias() {
    let categoriaSeleccionada = this.value.toLocaleLowerCase()
    let seleccionFiltrada = []

    if (categoriaSeleccionada === "todo") {
        seleccionFiltrada = productos
    } else {
        seleccionFiltrada = productos.filter(producto => producto.categoria.toLocaleLowerCase() === categoriaSeleccionada)
    }

    mostrarProductos(seleccionFiltrada)
}

function filtrarProductos() {
    const textoBusqueda = document.getElementById("barraBusqueda").value.toLowerCase().trim()
    let categoriaSeleccionada = document.getElementById("seleccionCategoria").value.toLocaleLowerCase()
    let productosFiltrados = []

    if (categoriaSeleccionada === "todo") {
        productosFiltrados = productos.filter(producto => producto.nombre.toLocaleLowerCase().includes(textoBusqueda) || producto.categoria.toLocaleLowerCase().includes(textoBusqueda))
    } else {
        productosFiltrados = productos.filter(producto => producto.nombre.toLocaleLowerCase().includes(textoBusqueda) && producto.categoria.toLocaleLowerCase() === categoriaSeleccionada)
    }

    mostrarProductos(productosFiltrados)
}

function mostrarProductos(productos) {
    seccionProductos.innerHTML = ""
    productos.forEach(producto => {
        let tarjetaProducto = document.createElement("div")
        tarjetaProducto.className = "producto"

        tarjetaProducto.innerHTML = `
            <img src="./images/${producto.imagen}"/>
            <h2>${producto.nombre}</h2>
            <h3>$${producto.precio}</h3>
            <p id="stockProducto-${producto.id}">Unidades restantes: ${producto.stock}</p>
            <button id=${producto.id}>Agregar al Carrito</button>
        `
        seccionProductos.append(tarjetaProducto)
    })

    document.getElementById("iconoBuscador").addEventListener("click", filtrarProductos)
    agregarProductosCarrito(productos)
    calcularTotalCarrito()
}

function agregarProductosCarrito(productosFiltrados) {
    document.querySelectorAll(".producto button").forEach(button => {
        button.addEventListener("click", () => {
            let productId = parseInt(button.id)
            let productoSeleccionado = productos.find(producto => producto.id === productId)
            if (productoSeleccionado.stock > 0) {
                let carrito = JSON.parse(localStorage.getItem("carrito")) || []
                let productoGuardado = carrito.find(item => item.id === productoSeleccionado.id)
                document.getElementById("cantidadSeleccionadaN").textContent = parseInt(document.getElementById("cantidadSeleccionadaN").textContent) + 1
                if (productoGuardado) {
                    productoGuardado.cantidad++
                } else {
                    carrito.push({
                        id: productoSeleccionado.id,
                        cantidad: 1
                    })
                }
                localStorage.setItem("carrito", JSON.stringify(carrito))
                productoSeleccionado.stock--
                mostrarProductos(productosFiltrados)
                infoProductosCarrito(productoSeleccionado, productos)
            } else {
                Toastify({
                    text: "Producto agotado",
                    duration: 1500,
                    style: {
                        background: "linear-gradient(red, orange)",
                    }
                }).showToast()
            }
        })
    })
}

function infoProductosCarrito(productoCarrito, productos) {
    let productosAgregados = document.getElementById("contenedorProductoCarrito")
    let tarjetaProductoCarrito = productosAgregados.querySelector(`#productoCarrito-${productoCarrito.id}`)
    let carrito = JSON.parse(localStorage.getItem("carrito")) || []
    let productoEnCarrito = carrito.find(item => item.id === productoCarrito.id)
    let cantidadActual = productoEnCarrito.cantidad
    let nuevoPrecioTotal = (cantidadActual) * productoCarrito.precio

    if (tarjetaProductoCarrito) {
        let cantidadProductoCarrito = tarjetaProductoCarrito.querySelector(`#cantidadProductoCarrito`)
        cantidadProductoCarrito.textContent = cantidadActual

        let tarjetaProducto = document.getElementById(productoCarrito.id)
        if (tarjetaProducto) {
            let stockElement = tarjetaProducto.querySelector('p')
            if (stockElement) {
                stockElement.textContent = `Unidades restantes: ${productoCarrito.stock}`
            }
        }
        tarjetaProductoCarrito.querySelector("#precioProductoCarrito").textContent = "$" + nuevoPrecioTotal
        totalCarrito += nuevoPrecioTotal

    } else {
        tarjetaProductoCarrito = document.createElement("div")
        tarjetaProductoCarrito.className = "productoCarrito"
        tarjetaProductoCarrito.id = `productoCarrito-${productoCarrito.id}`

        tarjetaProductoCarrito.innerHTML = `
            <span id="cantidadProductoCarrito">${cantidadActual}</span>
            <p id="nombreProductoCarrito">${productoCarrito.nombre}</p>
            <span id="precioProductoCarrito">$${nuevoPrecioTotal}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" id="iconoEliminarProductoCarrito"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>  
        `
        productosAgregados.append(tarjetaProductoCarrito)
    }

    let eliminarProducto = tarjetaProductoCarrito.querySelector("#iconoEliminarProductoCarrito")
    eliminarProducto.addEventListener("click", () => {
        eliminarProductoDelCarrito(productoEnCarrito.id, tarjetaProductoCarrito)
    })
    
    calcularTotalCarrito()
}
function eliminarProductoDelCarrito(productId, tarjetaProductoCarrito) {
    let categoriaSeleccionada = document.getElementById("seleccionCategoria").value
    let textoBusqueda = document.getElementById("barraBusqueda").value.toLowerCase().trim()

    let carrito = JSON.parse(localStorage.getItem("carrito")) || []
    let productoEnCarrito = carrito.find(item => item.id === productId)
    if (productoEnCarrito) {
        document.getElementById("cantidadSeleccionadaN").textContent = parseInt(document.getElementById("cantidadSeleccionadaN").textContent) - productoEnCarrito.cantidad
        tarjetaProductoCarrito.remove()
        carrito = carrito.filter(item => item.id !== productId)
        localStorage.setItem("carrito", JSON.stringify(carrito))
        let producto = productos.find(producto => producto.id === productId)
        if (producto) {
            producto.stock += productoEnCarrito.cantidad
        }
    }

    let opcionesCategoria = document.getElementById("seleccionCategoria").options
    let categoriaValida = Array.from(opcionesCategoria).some(opcion => opcion.value === categoriaSeleccionada)
    if (categoriaValida) {
        document.getElementById("seleccionCategoria").value = categoriaSeleccionada
    } else {
        document.getElementById("seleccionCategoria").value = "todo"
    }
    document.getElementById("barraBusqueda").value = textoBusqueda
    filtrarProductos()
}

function calcularTotalCarrito() {
    let preciosProductos = document.querySelectorAll("#precioProductoCarrito")
    totalCarrito = 0
    let tituloCarrito = document.getElementById("tituloTotalCarrito")
    let botonPagarCarrito = document.getElementById("botonPagarCarrito")
    let totalDelCarrito = document.getElementById("totalCarrito")

    if (preciosProductos.length === 0) {
        tituloCarrito.textContent = "No hay productos en el carrito"
        botonPagarCarrito.style.display = "none"
        totalDelCarrito.style.display = "none"
    } else {
        preciosProductos.forEach(precioProducto => {
            totalCarrito += parseFloat(precioProducto.textContent.replace("$", ""))
        })
        totalDelCarrito.textContent = "$" + totalCarrito
        totalDelCarrito.style.display = "block"
        botonPagarCarrito.style.display = "block"
        tituloCarrito.textContent = "Total:"
    }
}



function alerta(title, text, icon, timer, timerProgressBar) {
    swal.fire({
        title,
        text,
        icon,
        timer,
        timerProgressBar
    })
}

botonPagarCarrito.addEventListener("click", () => {
    let contenedorProductoCarrito = document.getElementById("contenedorProductoCarrito")
    document.getElementById("cantidadSeleccionadaN").textContent = "0"
    localStorage.removeItem("carrito")
    contenedorProductoCarrito.innerHTML = ""
    totalCarrito = 0
    calcularTotalCarrito()
    alerta("Compra Realizada", "Su compra se completo sin problemas", "success", 3000, true)
    document.getElementById("seleccionCategoria").value = "todo"
    mostrarProductos(productos)
})

let totalCarrito = 0
let seccionProductos = document.getElementById("productos")

let iconoTienda = document.getElementById("cantidadIconoCarrito")
let carrito = document.getElementById("contenedorCarrito")

iconoTienda.addEventListener("click", () => {
    carrito.classList.toggle("contenedorCarritoOculto")
})

document.getElementById("seleccionCategoria").addEventListener("change", filtradoCategorias)
cargarProductos()