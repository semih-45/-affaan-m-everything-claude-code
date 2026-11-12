#!/bin/bash
# planche-contact : tools/sheet.sh <format> <cols> <sortie.jpg> t1,t2,...
f=$1; cols=$2; out=$3; ts=$4; d=$(mktemp -d); node tools/render.js $f --still $ts $d/%t.png 1 || exit 1
ins=(); n=0; for t in ${ts//,/ }; do ins+=(-i $d/$t.png); n=$((n+1)); done
rows=$(( (n+cols-1)/cols )); w=$([ $f = vertical ] && echo 432 || echo 960)
ffmpeg -y -loglevel error "${ins[@]}" -filter_complex "$(for i in $(seq 0 $((n-1))); do printf "[$i]scale=$w:-1[a$i];"; done)$(for i in $(seq 0 $((n-1))); do printf "[a$i]"; done)xstack=inputs=$n:layout=$(for i in $(seq 0 $((n-1))); do printf "%s_%s|" $(( (i%cols)*w )) $(( (i/cols)*(f == 0 ? 0:0) + (i/cols)*$([ $f = vertical ] && echo 768 || echo 540) )); done | sed 's/|$//')" -q:v 3 $out; rm -rf $d
