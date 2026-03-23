# FlashBank — Dashboard de Transacciones

Dashboard frontend para visualizar el historial de transacciones bancarias, construido como prueba técnica para la posición de Frontend Mid.

## Setup rápido

```bash
# Requiere Node 20+
nvm use 20

npm install
npm run dev
# → http://localhost:3000
```

### Tests

```bash
npm test          # correr una vez
npm run test:watch # modo watch
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
├── hooks/                      # Hooks genéricos (uso futuro)
├── services/
│   └── transactionService.ts   # Capa de acceso a la API
├── mocks/
│   ├── db.ts                   # Generador de datos en memoria (500 txns/cuenta)
│   ├── handlers.ts             # Handlers MSW (GET history + PATCH reviewed)
│   ├── browser.ts              # Worker para desarrollo
│   └── server.ts               # Server para testing
├── types/
│   └── transaction.ts          # Tipos TypeScript estrictos
└── lib/
    └── utils.ts                # cn() helper
```

**Por qué esta estructura:** separar por _feature_ (transactions) permite escalar sin que los cambios en un dominio afecten otros. Los componentes en `components/ui` son agnósticos al negocio, lo que los hace reutilizables. Los `services/` abstraen el transporte HTTP del resto de la app.

---

## Decisiones técnicas

### React Query v5 vs SWR

Elegí **React Query v5** por su soporte nativo de `useInfiniteQuery` con `initialPageParam` y `getNextPageParam`, y por las mutations con soporte de primer clase para rollback optimista mediante `onMutate` / `onError`. SWR requiere más boilerplate para infinite scroll y el rollback optimista es manual.

### Stale time: 5 minutos

El historial bancario es quasi-inmutable en ventanas cortas (las transacciones pasadas no cambian). Con `staleTime: 5 * 60 * 1000` evitamos re-fetches en cada montaje/navegación, aliviando carga en el backend. El `gcTime: 10 min` garantiza que la caché no se acumule indefinidamente.

### Virtualización con `@tanstack/react-virtual`

Con listas de miles de ítems, renderizar todos los nodos DOM degrada el rendimiento. `useVirtualizer` mantiene solo los nodos visibles + `overscan: 5` en el DOM, reduciendo el trabajo del navegador de O(n) a O(viewport). El scroll infinito por cursor (vs offset) evita duplicados cuando llegan transacciones nuevas entre páginas.

### Optimistic updates

En `markAsReviewed`:
1. `onMutate`: cancelamos queries en vuelo, guardamos snapshot, actualizamos el cache inmediatamente.
2. `onError`: restauramos el snapshot → el usuario ve el rollback automático.
3. `onSettled`: invalidamos el query para sincronizar con el servidor.

Esto da feedback instantáneo (<16ms) sin depender de la latencia de red.

### URL state para filtros

Los filtros se persisten en `URLSearchParams` mediante el hook `useTransactionFilters`. Esto permite:
- **Compartir** el estado exacto vía URL.
- **Recargar** sin perder el contexto de búsqueda.
- **Historial del navegador** funciona correctamente.

Se usa `router.replace` (no `push`) para no contaminar el historial con cada cambio de filtro.

### Debounce 300ms

La búsqueda por descripción aplica un debounce de 300ms antes de actualizar la URL y disparar el fetch. Esto es suficiente para usuarios que escriben a velocidad normal (~40 WPM) sin que la UI se sienta lenta.

### useMemo sin sobre-memoizar

`useMemo` se usa únicamente en `TransactionDashboard` para derivar las estadísticas de resumen (créditos/débitos/pendientes), ya que es un cómputo sobre el array completo de transacciones. Los componentes de presentación puros (TransactionItem, Badge, etc.) no necesitan memoización porque React es eficiente en re-renders pequeños.

### Server Components vs Client Components (Next.js App Router)

| Componente | Tipo | Justificación |
|---|---|---|
| `app/accounts/[accountId]/page.tsx` | **Server** | Solo extrae `params` y renderiza layout. No necesita estado ni efectos. |
| `TransactionDashboard` | **Client** | Usa hooks de React Query, URL state y event handlers. |
| `TransactionList` | **Client** | Virtualización requiere acceso al DOM. |
| `TransactionFilters` | **Client** | Maneja eventos de input en tiempo real. |
| `TransactionItem` | **Client** | Botón de acción, callbacks. |
| `Badge`, `Button`, `Skeleton` | **Client** | Marcados como `"use client"` por ser importados desde Client Components. |

### Mock con MSW

MSW intercepta las peticiones en el Service Worker (dev) y con `setupServer` (tests), lo que permite probar la capa de red de forma realista sin modificar el código de producción. Los mocks generan 500 transacciones por cuenta con distribución realista de tipos y estados.

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
| URL state | useSearchParams (Next.js) | — |
| Fechas | date-fns | 4 |
