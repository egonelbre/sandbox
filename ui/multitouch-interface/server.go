package main

import (
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var addr = flag.String("addr", "127.0.0.1:8000", "http service address") // Q=17, R=18

const (
	StaticDir = "static/"
)

var (
	mainTemplate, _  = template.ParseFiles("index.html")
	errorTemplate, _ = template.ParseFiles("error.html")
)

func main() {
	flag.Parse()
	fmt.Println("Started on: ", *addr)
	http.HandleFunc("/", errorHandler(handler))
	http.HandleFunc("/static/", errorHandler(static))
	log.Fatal(http.ListenAndServe(*addr, nil))
}

func errorHandler(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if e := recover(); e != nil {
				w.WriteHeader(500)
				errorTemplate.Execute(w, e)
			}
		}()
		fn(w, r)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	mainTemplate.Execute(w, nil)
}

func static(w http.ResponseWriter, r *http.Request) {
	filename := r.URL.Path[8:]
	http.ServeFile(w, r, StaticDir+filename)
}
