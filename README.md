# FlashBank — Dashboard de Transacciones

> Prueba técnica para la posición de **Frontend Mid**. Dashboard para visualizar y gestionar el historial de transacciones bancarias con virtualización, scroll infinito, filtros persistentes en URL y actualizaciones optimistas.

**Demo en vivo →** [https://flashbank.ricardoasin.com/](https://flashbank.ricardoasin.com/)

---

## Características implementadas

| # | Desafío | Estado |
|---|---------|--------|
| 01 | Listado con virtualización + scroll infinito | ✅ |
| 02 | Caché local y optimistic updates con rollback | ✅ |
| 03 | Filtros, búsqueda con debounce y URL state | ✅ |
| 04 | Arquitectura por features, tests y accesibilidad | ✅ |

**Highlights:**
- **Virtualización** — solo renderiza los ítems visibles del viewport con `@tanstack/react-virtual`, manejando listas de 500+ transacciones sin degradar el rendimiento
- **Scroll infinito** — paginación por cursor, evita duplicados al llegar nuevas transacciones entre páginas
- **Optimistic updates** — "marcar como revisada" actualiza la UI en <16ms con rollback automático ante error del servidor
- **URL state** — los filtros se persisten en `URLSearchParams`, el estado es compartible y sobrevive recargas
- **Dark mode** — soporte completo vía Tailwind CSS
- **Accesibilidad** — roles ARIA, `aria-label`, `aria-live` en estados de carga/error

---

## Setup

```bash
# Requiere Node 20+
nvm use 20

npm install
npm run dev
# → http://localhost:3000
```

### Tests

```bash
npm test            # correr una vez
npm run test:watch  # modo watch
```

---

## Estructura del proyecto

```
src/
├── app/                        # Next.js App Router
│   ├── accounts/[accountId]/   # Página de historial (Server Component)
│   └── layout.tsx
├── features/
│   └── transactions/
│       ├── components/         # UI específica del dominio
│       │   ├── TransactionDashboard.tsx
│       │   ├── TransactionList.tsx
│       │   ├── TransactionItem.tsx
│       │   └── TransactionFilters.tsx
│       ├── hooks/
│       │   ├── useTransactionHistory.ts   # hook principal con React Query
│       │   └── useTransactionFilters.ts   # estado de filtros + URL sync
│       └── __tests__/
├── components/
│   └── ui/                     # Componentes genéricos reutilizables
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Skeleton.tsx
├── services/
│   └── transactionService.ts   # Capa de acceso a la API (fetch + tipado)
├── mocks/
│   ├── db.ts                   # Generador en memoria (500 txns/cuenta)
│   ├── handlers.ts             # Handlers MSW (GET history + PATCH reviewed)
│   ├── browser.ts              # Worker para desarrollo
│   └── server.ts               # Server para testing
├── types/
│   └── transaction.ts          # Tipos TypeScript estrictos
└── lib/
    └── utils.ts                # cn() helper (clsx + tailwind-merge)
```

La estructura **feature-first** aísla el dominio `transactions` de forma que escalar a nuevas features (cuentas, transferencias, etc.) no requiere tocar código existente. Los componentes en `components/ui` son agnósticos al negocio. Los `services/` abstraen el transporte HTTP.

---

## Decisiones técnicas

### React Query v5 vs SWR

Se eligió **React Query v5** por su soporte nativo de `useInfiniteQuery` con `initialPageParam` y `getNextPageParam`, y por las mutations con soporte de primer clase para rollback optimista mediante `onMutate` / `onError`. SWR requiere más boilerplate para infinite scroll y el rollback optimista es completamente manual.

### Stale time: 5 minutos

El historial bancario es quasi-inmutable en ventanas cortas (las transacciones pasadas no cambian). Con `staleTime: 5 * 60 * 1000` se evitan re-fetches en cada montaje o navegación, aliviando carga en el backend. El `gcTime: 10 min` garantiza que la caché no se acumule indefinidamente.

### Virtualización con `@tanstack/react-virtual`

Con listas de miles de ítems, renderizar todos los nodos DOM degrada el rendimiento de forma lineal. `useVirtualizer` mantiene solo los nodos visibles + `overscan: 5` en el DOM, reduciendo el trabajo del navegador de O(n) a O(viewport). El scroll infinito por cursor (vs offset) evita duplicados cuando llegan transacciones nuevas entre páginas.

### Optimistic updates

En `markAsReviewed`:
1. `onMutate` — cancela queries en vuelo, guarda snapshot del cache, actualiza la UI inmediatamente
2. `onError` — restaura el snapshot → el usuario ve el rollback automático
3. `onSettled` — invalida el query para sincronizar con el servidor

Esto entrega feedback instantáneo (<16ms) sin depender de la latencia de red.

### URL state para filtros

Los filtros se persisten en `URLSearchParams` mediante `useTransactionFilters`. Esto permite:
- **Compartir** el estado exacto vía URL
- **Recargar** sin perder el contexto de búsqueda
- **Historial del navegador** funciona correctamente

Se usa `router.replace` (no `push`) para no contaminar el historial con cada cambio de filtro.

### Debounce 300ms

La búsqueda por descripción aplica un debounce de 300ms antes de actualizar la URL y disparar el fetch. Es suficiente para usuarios que escriben a velocidad normal (~40 WPM) sin que la UI se sienta lenta.

### Resumen (totales) vs lista paginada

Las tarjetas **Total / Créditos / Débitos / Pendientes** usan `total` y `summary` que vienen en la **primera respuesta** del historial: el backend calcula agregados sobre **todo** el conjunto filtrado (500 ítems o los que correspondan), no sobre las filas ya cargadas en el cliente. Así los números no cambian al hacer scroll infinito. Los componentes de presentación puros (`TransactionItem`, `Badge`, etc.) no necesitan `useMemo` extra.

### Server Components vs Client Components

| Componente | Tipo | Justificación |
|---|---|---|
| `app/accounts/[accountId]/page.tsx` | **Server** | Solo extrae `params` y renderiza layout. Sin estado ni efectos. |
| `TransactionDashboard` | **Client** | Hooks de React Query, URL state y event handlers. |
| `TransactionList` | **Client** | Virtualización requiere acceso al DOM. |
| `TransactionFilters` | **Client** | Maneja eventos de input en tiempo real. |
| `TransactionItem` | **Client** | Botón de acción, callbacks. |
| `Badge`, `Button`, `Skeleton` | **Client** | Importados desde Client Components. |

### Mock con MSW

MSW intercepta las peticiones en el Service Worker (dev) y con `setupServer` (tests), permitiendo probar la capa de red de forma realista sin modificar el código de producción. Los mocks generan 500 transacciones por cuenta con distribución realista de tipos y estados.

---

## Stack

| Categoría | Herramienta | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 14 |
| Lenguaje | TypeScript strict | 5 |
| Datos | React Query | 5 |
| Virtualización | @tanstack/react-virtual | 3 |
| Estilos | Tailwind CSS + CVA | 3 |
| Iconos | lucide-react | latest |
| Testing | Vitest + RTL + MSW | latest |
| URL state | nuqs / useSearchParams | 2 |
| Fechas | date-fns | 4 |
