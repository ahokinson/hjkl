export default [
  {
    filetype: "c",
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define INITIAL_CAPACITY 8
#define LOAD_FACTOR 0.75

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t capacity;
    size_t size;
} HashMap;

static unsigned long hash(const char *str) {
    unsigned long h = 5381;
    int c;
    while ((c = *str++)) {
        h = ((h << 5) + h) + c;
    }
    return h;
}

HashMap *hashmap_create(void) {
    HashMap *map = malloc(sizeof(HashMap));
    map->capacity = INITIAL_CAPACITY;
    map->size = 0;
    map->buckets = calloc(map->capacity, sizeof(Entry *));
    return map;
}

static void hashmap_resize(HashMap *map) {
    size_t new_cap = map->capacity * 2;
    Entry **new_buckets = calloc(new_cap, sizeof(Entry *));

    for (size_t i = 0; i < map->capacity; i++) {
        Entry *e = map->buckets[i];
        while (e) {
            Entry *next = e->next;
            size_t idx = hash(e->key) % new_cap;
            e->next = new_buckets[idx];
            new_buckets[idx] = e;
            e = next;
        }
    }

    free(map->buckets);
    map->buckets = new_buckets;
    map->capacity = new_cap;
}

void hashmap_set(HashMap *map, const char *key, int value) {
    if ((double)map->size / map->capacity >= LOAD_FACTOR) {
        hashmap_resize(map);
    }

    size_t idx = hash(key) % map->capacity;
    Entry *e = map->buckets[idx];

    while (e) {
        if (strcmp(e->key, key) == 0) {
            e->value = value;
            return;
        }
        e = e->next;
    }

    Entry *new_entry = malloc(sizeof(Entry));
    new_entry->key = strdup(key);
    new_entry->value = value;
    new_entry->next = map->buckets[idx];
    map->buckets[idx] = new_entry;
    map->size++;
}

int hashmap_get(HashMap *map, const char *key, int *out) {
    size_t idx = hash(key) % map->capacity;
    Entry *e = map->buckets[idx];

    while (e) {
        if (strcmp(e->key, key) == 0) {
            *out = e->value;
            return 1;
        }
        e = e->next;
    }
    return 0;
}

void hashmap_free(HashMap *map) {
    for (size_t i = 0; i < map->capacity; i++) {
        Entry *e = map->buckets[i];
        while (e) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
    }
    free(map->buckets);
    free(map);
}`,
  },
];
