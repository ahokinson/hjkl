export default [
  {
    filetype: "go",
    code: `package cache

import (
\t"sync"
\t"time"
)

type entry[V any] struct {
\tvalue     V
\texpiresAt time.Time
}

type Cache[K comparable, V any] struct {
\tmu      sync.RWMutex
\titems   map[K]entry[V]
\tdefault time.Duration
}

func New[K comparable, V any](defaultTTL time.Duration) *Cache[K, V] {
\tc := &Cache[K, V]{
\t\titems:   make(map[K]entry[V]),
\t\tdefault: defaultTTL,
\t}
\tgo c.cleanup()
\treturn c
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
\tc.mu.RLock()
\tdefer c.mu.RUnlock()

\te, ok := c.items[key]
\tif !ok || time.Now().After(e.expiresAt) {
\t\tvar zero V
\t\treturn zero, false
\t}
\treturn e.value, true
}

func (c *Cache[K, V]) Set(key K, value V) {
\tc.SetWithTTL(key, value, c.default)
}

func (c *Cache[K, V]) SetWithTTL(key K, value V, ttl time.Duration) {
\tc.mu.Lock()
\tdefer c.mu.Unlock()

\tc.items[key] = entry[V]{
\t\tvalue:     value,
\t\texpiresAt: time.Now().Add(ttl),
\t}
}

func (c *Cache[K, V]) Delete(key K) {
\tc.mu.Lock()
\tdefer c.mu.Unlock()
\tdelete(c.items, key)
}

func (c *Cache[K, V]) Len() int {
\tc.mu.RLock()
\tdefer c.mu.RUnlock()
\treturn len(c.items)
}

func (c *Cache[K, V]) cleanup() {
\tticker := time.NewTicker(time.Minute)
\tdefer ticker.Stop()

\tfor range ticker.C {
\t\tc.mu.Lock()
\t\tnow := time.Now()
\t\tfor k, e := range c.items {
\t\t\tif now.After(e.expiresAt) {
\t\t\t\tdelete(c.items, k)
\t\t\t}
\t\t}
\t\tc.mu.Unlock()
\t}
}`,
  },
];
