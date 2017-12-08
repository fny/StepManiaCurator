
jruby -Xcompile.invokedynamic=true -J-Xmn512m -J-Xms2048m -J-Xmx2048m -J-server -S bundle exec puma -t 8:16 -b tcp://0.0.0.0:2149 config.ru -e production
